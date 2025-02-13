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
};
