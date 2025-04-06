/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../error/AppError";

export const couponMutationResolver = {

    createCoupon: async (
        parent: any,
        { input }: any,
        { prisma, userInfo }: any
      ) => {
        if (userInfo.role !== "VENDOR") {
          throw new AppError("Only vendors can create coupons", "FORBIDDEN");
        }
  
        // Get vendor's shop
        const vendor = await prisma.vendor.findUnique({
          where: { userId: userInfo.userId },
          include: { shop: true },
        });
  
        if (!vendor || !vendor.shop) {
          throw new AppError("Vendor or shop not found", "NOT_FOUND");
        }
  
        // Generate coupon code if not provided
        // const couponCode = input.code || generateCouponCode();
  
        // Validate dates
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
  
        if (startDate >= endDate) {
          throw new AppError("End date must be after start date", "BAD_REQUEST");
        }
  
        const coupon = await prisma.coupon.create({
          data: {
            code: input.couponCode,
            description: input.description,
            discountType: input.discountType,
            discountValue: input.discountValue,
            minPurchaseAmount: input.minPurchaseAmount,
            maxDiscountAmount: input.maxDiscountAmount,
            startDate,
            endDate,
            usageLimit: input.usageLimit,
            shopId: vendor.shop.id,
          },
          include: {
            shop: true,
          },
        });
  
        return {
          statusCode: 201,
          success: true,
          message: "Coupon created successfully",
          data: coupon,
        };
      },


      updateCoupon: async (
        parent: any,
        { id, input }: any,
        { prisma, userInfo }: any
      ) => {
        if (userInfo.role !== "VENDOR") {
          throw new AppError("Only vendors can update coupons", "FORBIDDEN");
        }
  
        // First get the coupon to check ownership
        const existingCoupon = await prisma.coupon.findUnique({
          where: { id },
          include: { shop: true },
        });
  
        if (!existingCoupon) {
          throw new AppError("Coupon not found", "NOT_FOUND");
        }
  
        // Get vendor's shop to verify ownership
        const vendor = await prisma.vendor.findUnique({
          where: { userId: userInfo.userId },
          include: { shop: true },
        });
  
        if (!vendor || !vendor.shop || vendor.shop.id !== existingCoupon.shopId) {
          throw new AppError("You can only update coupons from your shop", "FORBIDDEN");
        }
  
        // Validate dates if provided
        let startDate = existingCoupon.startDate;
        let endDate = existingCoupon.endDate;
  
        if (input.startDate || input.endDate) {
          startDate = input.startDate ? new Date(input.startDate) : startDate;
          endDate = input.endDate ? new Date(input.endDate) : endDate;
  
          if (startDate >= endDate) {
            throw new AppError("End date must be after start date", "BAD_REQUEST");
          }
        }
  
        const updatedCoupon = await prisma.coupon.update({
          where: { id },
          data: {
            code: input.code,
            description: input.description,
            discountType: input.discountType,
            discountValue: input.discountValue,
            minPurchaseAmount: input.minPurchaseAmount,
            maxDiscountAmount: input.maxDiscountAmount,
            startDate,
            endDate,
            isActive: input.isActive,
            usageLimit: input.usageLimit,
          },
          include: {
            shop: true,
            products: true,
          },
        });
  
        return {
          statusCode: 200,
          success: true,
          message: "Coupon updated successfully",
          data: updatedCoupon,
        };
      },

      deleteCoupon: async (
        parent: any,
        { id }: any,
        { prisma, userInfo }: any
      ) => {
        if (userInfo.role !== "VENDOR") {
          throw new AppError("Only vendors can delete coupons", "FORBIDDEN");
        }
  
        // First get the coupon to check ownership
        const existingCoupon = await prisma.coupon.findUnique({
          where: { id },
          include: { shop: true, products: true },
        });
  
        if (!existingCoupon) {
          throw new AppError("Coupon not found", "NOT_FOUND");
        }
  
        // Get vendor's shop to verify ownership
        const vendor = await prisma.vendor.findUnique({
          where: { userId: userInfo.userId },
          include: { shop: true },
        });
  
        if (!vendor || !vendor.shop || vendor.shop.id !== existingCoupon.shopId) {
          throw new AppError("You can only delete coupons from your shop", "FORBIDDEN");
        }
  
        // Check if coupon is used in any products
        if (existingCoupon.products.length > 0) {
          throw new AppError(
            "Cannot delete coupon that is applied to products. Remove it from products first.",
            "BAD_REQUEST"
          );
        }
  
        await prisma.coupon.delete({
          where: { id },
        });
  
        return {
          statusCode: 200,
          success: true,
          message: "Coupon deleted successfully",
          data: existingCoupon,
        };
      },

      applyCouponToProduct: async (
        parent: any,
        { couponId, productId }: any,
        { prisma, userInfo }: any
      ) => {
        if (userInfo.role !== "VENDOR") {
          throw new AppError("Only vendors can apply coupons", "FORBIDDEN");
        }
  
        // Check if coupon exists and belongs to vendor's shop
        const coupon = await prisma.coupon.findUnique({
          where: { id: couponId },
          include: { shop: true },
        });
  
        if (!coupon) {
          throw new AppError("Coupon not found", "NOT_FOUND");
        }
  
        // Get vendor's shop to verify ownership
        const vendor = await prisma.vendor.findUnique({
          where: { userId: userInfo.userId },
          include: { shop: true },
        });
  
        if (!vendor || !vendor.shop || vendor.shop.id !== coupon.shopId) {
          throw new AppError("You can only apply coupons from your shop", "FORBIDDEN");
        }
  
        // Check if coupon is active and valid
        const now = new Date();
        if (!coupon.isActive || now < coupon.startDate || now > coupon.endDate) {
          throw new AppError("Coupon is not currently valid", "BAD_REQUEST");
        }
  
        // Check if product exists and belongs to vendor's shop
        const product = await prisma.product.findUnique({
          where: { id: productId },
          include: { shop: true },
        });
  
        if (!product) {
          throw new AppError("Product not found", "NOT_FOUND");
        }
  
        if (product.shop.vendorId !== vendor.id) {
          throw new AppError("You can only apply coupons to your products", "FORBIDDEN");
        }
  
        // Check if product already has a coupon
        if (product.couponId) {
          throw new AppError(
            "Product already has a coupon. Remove it first.",
            "BAD_REQUEST"
          );
        }
  
        // Apply coupon to product
        const updatedProduct = await prisma.product.update({
          where: { id: productId },
          data: {
            couponId,
          },
          include: {
            coupon: true,
            variants: true,
            shop: true,
            itemCategory: true,
          },
        });
  
        return {
          statusCode: 200,
          success: true,
          message: "Coupon applied to product successfully",
          data: updatedProduct,
        };
      },
  

};