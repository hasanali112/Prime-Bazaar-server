/* eslint-disable @typescript-eslint/no-explicit-any */

import { UserRole } from "@prisma/client";
import AppError from "../../error/AppError";
import { uploadSingleImageToCloudinary } from "../../utils/upload";

export const shopMutationResolver = {
  createShop: async (
    parent: any,
    {
      input,
    }: {
      input: {
        name: string;
        logo: File;
        description: string;
        email: string;
        contactNumber: string;
      };
    },
    { prisma, userInfo }: any
  ) => {
    const { name, logo, description, email, contactNumber } = input;

    // Check if the user is a vendor
    if (userInfo.role !== UserRole.VENDOR) {
      throw new AppError("Only vendors can create shops", "FORBIDDEN");
    }

    // Check if vendor exists
    const user = await prisma.user.findUnique({
      where: { id: userInfo.userId },
      include: { vendor: true },
    });

    if (!user.vendor) {
      throw new AppError("Vendor profile not found", "NOT_FOUND");
    }

    // Check if vendor already has a shop
    const existingShop = await prisma.shop.findUnique({
      where: { vendorId: user.vendor.id },
    });

    if (existingShop) {
      throw new AppError("Vendor already has a shop", "BAD_REQUEST");
    }

    // Upload logo to Cloudinary
    const uploadedImage: any = await uploadSingleImageToCloudinary(
      logo,
      "logo"
    );

    // Create shop with vendorId
    const shop = await prisma.shop.create({
      data: {
        name,
        logo: uploadedImage.secure_url,
        description,
        email,
        contactNumber,
        vendorId: user.vendor.id,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Shop created successfully",
      data: shop,
    };
  },

  updateShop: async (
    parent: any,
    {
      id,
      input,
    }: {
      id: string;
      input: {
        name?: string;
        logo?: File;
        description?: string;
        email?: string;
        contactNumber?: string;
        isDeleted?: boolean;
        isTemporaryDeleted?: boolean;
      };
    },
    { prisma, userInfo }: any
  ) => {
    // First check if shop exists
    const shop = await prisma.shop.findUnique({
      where: { id },
      include: { vendor: true },
    });

    if (!shop) {
      throw new AppError("Shop not found", "NOT_FOUND");
    }

    // Check permissions - only the owner vendor or admin can update
    if (
      userInfo.role !== UserRole.ADMIN &&
      (userInfo.role !== UserRole.VENDOR ||
        shop.vendor.userId !== userInfo.userId)
    ) {
      throw new AppError(
        "You don't have permission to update this shop",
        "FORBIDDEN"
      );
    }

    // Prepare update data
    const updateData: any = { ...input };

    // Handle logo upload if provided
    if (input.logo) {
      const uploadedImage: any = await uploadSingleImageToCloudinary(
        input.logo,
        "logo"
      );
      updateData.logo = uploadedImage.secure_url;
    }

    // Handle admin-only fields
    // Remove fields that only admin should be able to update
    // if (userInfo.role !== UserRole.ADMIN) {
    //   delete updateData.isDeleted;
    //   delete updateData.isTemporaryDeleted;
    // }

    // Update shop
    const updatedShop = await prisma.shop.update({
      where: { id },
      data: updateData,
    });

    return {
      statusCode: 200,
      success: true,
      message: "Shop updated successfully",
      data: updatedShop,
    };
  },
};
