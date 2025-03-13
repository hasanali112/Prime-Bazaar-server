/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, ShippingMethod, UserRole } from "@prisma/client";
import AppError from "../../error/AppError";
import { uploadMultipleImagesToCloudinary } from "../../utils/upload";
import { generateSKU } from "./generateSKUFunction";

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
      include: { vendor: true },
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

    // Create product with transaction to ensure all operations succeed or fail together
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

        // Create variants if provided
        if (input.variants && input.variants.length > 0) {
          for (const variant of input.variants) {
            // Upload images for each variant
            const uploadedImages = await uploadMultipleImagesToCloudinary(
              variant.images,
              "products"
            );

            const imageUrls = uploadedImages.map((img: any) => img.secure_url);

            // Create the variant
            await tx.variant.create({
              data: {
                color: variant.color,
                images: imageUrls,
                sizes: variant.sizes || [],
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
};
