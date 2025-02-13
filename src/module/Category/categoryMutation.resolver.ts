/* eslint-disable @typescript-eslint/no-explicit-any */

import { UserRole } from "@prisma/client";
import AppError from "../../error/AppError";
import { uploadSingleImageToCloudinary } from "../../utils/upload";

export const categoryMutationResolver = {
  createCategory: async (
    _parent: any,
    { input }: { input: { name: string; image: File; categoryCode: string } },
    { prisma, userInfo }: any
  ) => {
    const { name, image, categoryCode } = input;
    // Guard to check if the user is an Admin
    if (userInfo.role !== UserRole.ADMIN) {
      throw new AppError(
        "You do not have permission to access this data",
        "FORBIDDEN"
      );
    }

    // Upload image to Cloudinary
    const uploadedImage: any = await uploadSingleImageToCloudinary(
      image,
      "categories"
    );

    // For multiple images
    // const multipleImagesResults = await uploadMultipleImagesToCloudinary(
    //   [image],
    //   "categories"
    // );

    // Save category to the database
    const category = await prisma.category.create({
      data: {
        name,
        image: uploadedImage.secure_url, // Save Cloudinary URL
        // multipleImages: multipleImagesResults.map(
        //   (result) => result.secure_url
        // ),
        categoryCode,
      },
    });

    return {
      statusCode: 201,
      success: true,
      message: "Category created successfully",
      data: category,
    };
  },

  updateCategory: async (
    _parent: any,
    {
      id,
      input,
    }: {
      id: string;
      input: { name?: string; image?: File; categoryCode?: string };
    },
    { prisma, userInfo }: any
  ) => {
    // Guard to check if the user is an Admin
    if (userInfo.role !== UserRole.ADMIN) {
      throw new AppError(
        "You do not have permission to access this data",
        "FORBIDDEN"
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new AppError("Category not found", "NOT_FOUND");
    }

    // Prepare update data
    const updateData: any = {};

    if (input.name) {
      updateData.name = input.name;
    }

    if (input.categoryCode) {
      updateData.categoryCode = input.categoryCode;
    }

    // Handle image upload if new image is provided
    if (input.image) {
      const uploadedImage: any = await uploadSingleImageToCloudinary(
        input.image,
        "categories"
      );
      updateData.image = uploadedImage.secure_url;
    }

    // Update category in the database
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return {
      statusCode: 200,
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    };
  },

  deleteCategory: async (
    _parent: any,
    { id }: { id: string },
    { prisma, userInfo }: any
  ) => {
    // Guard to check if the user is an Admin
    if (userInfo.role !== UserRole.ADMIN) {
      throw new AppError(
        "You do not have permission to access this data",
        "FORBIDDEN"
      );
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new AppError("Category not found", "NOT_FOUND");
    }

    // Delete category from the database
    await prisma.category.delete({
      where: { id },
    });

    return {
      statusCode: 200,
      success: true,
      message: "Category deleted successfully",
      data: null,
    };
  },
};
