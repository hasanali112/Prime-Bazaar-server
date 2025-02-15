/* eslint-disable @typescript-eslint/no-explicit-any */

import { UserRole } from "@prisma/client";
import AppError from "../../error/AppError";
import { handleResolver } from "../../utils/handleResolver";

export const categoryMutationResolver = {
  createMainCategory: async (
    _: any,
    { input }: { input: { name: string; description?: string } },
    { prisma, userInfo }: any
  ) => {
    return handleResolver(async () => {
      // Guard to check if the user is an Admin
      if (userInfo.role !== UserRole.ADMIN) {
        throw new AppError(
          "You are not authorized to perform this action",
          "FORBIDDEN"
        );
      }

      const existingCategory = await prisma.mainCategory.findUnique({
        where: { name: input.name },
      });

      if (existingCategory) {
        throw new AppError("Category already exists", "BAD_REQUEST");
      }

      const category = await prisma.mainCategory.create({
        data: input,
        include: {
          subCategories: true,
        },
      });

      return {
        success: true,
        statusCode: 201,
        message: "Main category created successfully",
        data: category,
      };
    });
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
