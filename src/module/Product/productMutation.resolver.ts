/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Prisma,
  ProductStatus,
  ShippingMethod,
  UserRole,
} from "@prisma/client";
import AppError from "../../error/AppError";
import { uploadMultipleImagesToCloudinary } from "../../utils/upload";
import { generateSKU } from "./generateSKUFunction";

interface VariantImage {
  color: string;
  imageUrls: string[];
  sizes: string[];
}

export const productMutationResolver = {
  createProduct: async (
    parent: any,
    {
      input,
    }: {
      input: {
        name: string;
        description?: string;
        price: number;
        stockQuantity: number;
        discountPercent?: number;
        brand: string;
        isFlashSale?: boolean;
        flashSaleEndTime?: string;
        shippingMethods: ShippingMethod;
        shippingCharge?: number;
        itemCategoryId: string;
        variants?: {
          color?: string;
          images: File[];
          sizes?: string[];
        }[];
      };
    },
    { prisma, userInfo }: any
  ) => {
    // Check if user is a vendor
    if (userInfo.role !== UserRole.VENDOR) {
      throw new AppError("Only vendors can create products", "FORBIDDEN");
    }

    // Find vendor's shop
    // Check if vendor exists
    const user = await prisma.user.findUnique({
      where: { id: userInfo.userId },
      include: {
        vendor: {
          include: {
            shop: true,
          },
        },
      },
    });

    if (!user.vendor) {
      throw new AppError("Vendor profile not found", "NOT_FOUND");
    }

    if (!user.vendor.shop) {
      throw new AppError("You need to create a shop first", "BAD_REQUEST");
    }

    // Check if shop is active
    if (user.vendor.shop.status !== "ACTIVE") {
      throw new AppError("Your shop is not active", "BAD_REQUEST");
    }

    // Validate item category exists
    const itemCategory = await prisma.itemCategory.findUnique({
      where: { id: input.itemCategoryId },
    });

    if (!itemCategory) {
      throw new AppError("Item category not found", "NOT_FOUND");
    }

    // Generate SKU
    const sku = generateSKU(input.name, user.vendor.shop.name);
    // Process and upload images for all variants before starting the transaction
    const uploadedVariantImages: VariantImage[] = [];

    if (input.variants && input.variants.length > 0) {
      for (const variant of input.variants) {
        // Upload images for each variant
        const uploadedImages = await uploadMultipleImagesToCloudinary(
          variant.images,
          "products"
        );

        uploadedVariantImages.push({
          color: variant.color ?? "",
          imageUrls: uploadedImages.map((img: any) => img.secure_url),
          sizes: variant.sizes || [],
        });
      }
    }

    // Now create product with transaction to ensure all database operations succeed or fail together
    const product = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Create the product first
        const newProduct = await tx.product.create({
          data: {
            sku,
            name: input.name,
            description: input.description,
            price: input.price,
            stockQuantity: input.stockQuantity,
            discountPercent: input.discountPercent,
            brand: input.brand,
            isFlashSale: input.isFlashSale || false,
            flashSaleEndTime: input.flashSaleEndTime
              ? new Date(input.flashSaleEndTime)
              : null,
            shippingMethods: input.shippingMethods,
            shippingCharge: input.shippingCharge,
            shopId: user.vendor.shop.id,
            itemCategoryId: input.itemCategoryId,
          },
        });

        // Create variants using pre-uploaded images
        if (uploadedVariantImages.length > 0) {
          for (const variantData of uploadedVariantImages) {
            await tx.variant.create({
              data: {
                color: variantData.color,
                images: variantData.imageUrls,
                sizes: variantData.sizes,
                productId: newProduct.id,
              },
            });
          }
        }

        // Return the complete product with variants
        return tx.product.findUnique({
          where: { id: newProduct.id },
          include: {
            variants: true,
            shop: true,
            itemCategory: true,
          },
        });
      }
    );

    return {
      statusCode: 201,
      success: true,
      message: "Product created successfully",
      data: product,
    };
  },

  //updateProduct
  updateProduct: async (
    parent: any,
    {
      id,
      input,
    }: {
      id: string;
      input: {
        name?: string;
        description?: string;
        price?: number;
        stockQuantity?: number;
        discountPercent?: number;
        brand?: string;
        isFlashSale?: boolean;
        flashSaleEndTime?: string;
        shippingMethods?: ShippingMethod;
        shippingCharge?: number;
        status?: ProductStatus;
        itemCategoryId?: string;
        variants?: {
          id?: string; // For updating existing variants
          color?: string;
          images?: File[];
          sizes?: string[];
        }[];
      };
    },
    { prisma, userInfo }: any
  ) => {
    // Check if user is a vendor
    if (userInfo.role !== UserRole.VENDOR) {
      throw new AppError("Only vendors can update products", "FORBIDDEN");
    }

    const user = await prisma.user.findUnique({
      where: { id: userInfo.userId },
      include: {
        vendor: {
          include: {
            shop: true,
          },
        },
      },
    });

    // Find the product to update
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        shop: true,
        variants: true,
      },
    });

    if (!existingProduct) {
      throw new AppError("Product not found", "NOT_FOUND");
    }

    // Check if the product belongs to the vendor's shop
    if (existingProduct.shop.vendorId !== user.vendor.id) {
      throw new AppError(
        "You can only update products in your shop",
        "FORBIDDEN"
      );
    }

    // Validate item category if provided
    if (input.itemCategoryId) {
      const itemCategory = await prisma.itemCategory.findUnique({
        where: { id: input.itemCategoryId },
      });

      if (!itemCategory) {
        throw new AppError("Item category not found", "NOT_FOUND");
      }
    }

    // Process and upload images for new variants
    const uploadedVariantImages: VariantImage[] = [];

    if (input.variants && input.variants.length > 0) {
      for (const variant of input.variants) {
        if (variant.images && variant.images.length > 0) {
          // Upload images for new variants
          const uploadedImages = await uploadMultipleImagesToCloudinary(
            variant.images,
            "products"
          );

          uploadedVariantImages.push({
            color: variant.color ?? "",
            imageUrls: uploadedImages.map((img: any) => img.secure_url),
            sizes: variant.sizes || [],
          });
        }
      }
    }

    // Update product and variants in a transaction
    const updatedProduct = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Update the product fields
        await tx.product.update({
          where: { id },
          data: {
            name: input.name,
            description: input.description,
            price: input.price,
            stockQuantity: input.stockQuantity,
            discountPercent: input.discountPercent,
            brand: input.brand,
            isFlashSale: input.isFlashSale,
            flashSaleEndTime: input.flashSaleEndTime
              ? new Date(input.flashSaleEndTime)
              : undefined,
            shippingMethods: input.shippingMethods,
            shippingCharge: input.shippingCharge,
            status: input.status,
            itemCategoryId: input.itemCategoryId,
          },
          include: {
            variants: true,
          },
        });

        // Handle variants
        if (input.variants && input.variants.length > 0) {
          for (const variantInput of input.variants) {
            if (variantInput.id) {
              // Update existing variant
              await tx.variant.update({
                where: { id: variantInput.id },
                data: {
                  color: variantInput.color,
                  sizes: variantInput.sizes,
                  // Only update images if new images are provided
                  images: variantInput.images
                    ? uploadedVariantImages.find(
                        (v) => v.color === variantInput.color
                      )?.imageUrls
                    : undefined,
                },
              });
            } else {
              // Create new variant
              await tx.variant.create({
                data: {
                  color: variantInput.color,
                  images: uploadedVariantImages.find(
                    (v) => v.color === variantInput.color
                  )?.imageUrls,
                  sizes: variantInput.sizes || [],
                  productId: id,
                },
              });
            }
          }
        }

        // Return the updated product with variants
        return tx.product.findUnique({
          where: { id },
          include: {
            variants: true,
            shop: true,
            itemCategory: true,
          },
        });
      }
    );

    return {
      statusCode: 200,
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    };
  },

  deleteProduct: async (
    parent: any,
    { id }: { id: string },
    { prisma, userInfo }: any
  ) => {
    // Find product and check if it exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: { shop: { include: { vendor: true } } },
    });

    if (!product) {
      throw new AppError("Product not found", "NOT_FOUND");
    }

    // Check if user has permission to delete the product
    // Only the shop owner (vendor) or an admin can delete a product
    if (
      userInfo.role !== UserRole.ADMIN &&
      (userInfo.role !== UserRole.VENDOR ||
        product.shop.vendor.userId !== userInfo.userId)
    ) {
      throw new AppError(
        "You don't have permission to delete this product",
        "FORBIDDEN"
      );
    }

    // For admins, hard delete the product
    if (userInfo.role === UserRole.ADMIN) {
      await prisma.product.delete({
        where: { id },
      });
    }
    // For vendors, soft delete by updating status
    else {
      await prisma.product.update({
        where: { id },
        data: {
          status: ProductStatus.DELETED,
        },
      });
    }

    return {
      statusCode: 200,
      success: true,
      message: "Product deleted successfully",
      data: null,
    };
  },

  addVariant: async (
    parent: any,
    {
      productId,
      variant,
    }: {
      productId: string;
      variant: {
        color?: string;
        images: File[];
        sizes?: string[];
      };
    },
    { prisma, userInfo }: any
  ) => {
    // Find product and check if it exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { shop: { include: { vendor: true } } },
    });

    if (!product) {
      throw new AppError("Product not found", "NOT_FOUND");
    }

    // Check if user has permission to add variant
    if (
      userInfo.role !== UserRole.ADMIN &&
      (userInfo.role !== UserRole.VENDOR ||
        product.shop.vendor.userId !== userInfo.userId)
    ) {
      throw new AppError(
        "You don't have permission to add variants to this product",
        "FORBIDDEN"
      );
    }

    // Upload images
    const uploadedImages = await uploadMultipleImagesToCloudinary(
      variant.images,
      "images"
    );

    const imageUrls = uploadedImages.map((img: any) => img.secure_url);

    // Create new variant
    await prisma.variant.create({
      data: {
        color: variant.color,
        images: imageUrls,
        sizes: variant.sizes || [],
        productId,
      },
    });

    // Fetch updated product with all variants
    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
        shop: true,
        itemCategory: true,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Variant added successfully",
      data: updatedProduct,
    };
  },
};
