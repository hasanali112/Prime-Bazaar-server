/* eslint-disable @typescript-eslint/no-explicit-any */

import { UserRole } from "@prisma/client";
import AppError from "../../error/AppError";
import { handleResolver } from "../../utils/handleResolver";

export const categoryMutationResolver = {
  createMainCategory: async (
    _parent: any,
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

  createSubCategory: async (
    _parent: any,
    {
      input,
    }: {
      input: { name: string; description?: string; mainCategoryId: string };
    },
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

      // Check if main category exists
      const mainCategory = await prisma.mainCategory.findUnique({
        where: { id: input.mainCategoryId },
      });

      if (!mainCategory) {
        throw new AppError("Main category not found", "NOT_FOUND");
      }

      const existingCategory = await prisma.subCategory.findUnique({
        where: { name: input.name },
      });

      if (existingCategory) {
        throw new AppError("Category already exists", "BAD_REQUEST");
      }

      const subCategory = await prisma.subCategory.create({
        data: input,
        include: {
          mainCategory: true,
          itemCategories: true,
        },
      });

      return {
        success: true,
        statusCode: 201,
        message: "Sub category created successfully",
        data: subCategory,
      };
    });
  },

  createItemCategory: async (
    _parent: any,
    {
      input,
    }: { input: { name: string; description?: string; subCategoryId: string } },
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

      // Check if sub category exists
      const subCategory = await prisma.subCategory.findUnique({
        where: { id: input.subCategoryId },
      });

      if (!subCategory) {
        throw new AppError("Sub category not found", "NOT_FOUND");
      }

      const existingCategory = await prisma.itemCategory.findUnique({
        where: { name: input.name },
      });

      if (existingCategory) {
        throw new AppError("Category already exists", "BAD_REQUEST");
      }

      const itemCategory = await prisma.itemCategory.create({
        data: input,
        include: {
          subCategory: true,
        },
      });

      return {
        success: true,
        statusCode: 201,
        message: "Item category created successfully",
        data: itemCategory,
      };
    });
  },

  // Dynamic resolver to update any type of category
  updateCategory: async (
    _parent: any,
    {
      input,
    }: {
      input: {
        categoryId: string;
        categoryType: "MAIN" | "SUB" | "ITEM";
        name?: string;
        description?: string;
      };
    },
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

      // Destructure input
      const { categoryId, categoryType, name, description } = input;

      // Initialize category data
      let categoryData: any;

      // Handle dynamic category update logic
      switch (categoryType) {
        case "MAIN":
          categoryData = await prisma.mainCategory.findUnique({
            where: { id: categoryId },
          });
          if (!categoryData) {
            throw new AppError("Main category not found", "NOT_FOUND");
          }
          // Update Main Category
          categoryData = await prisma.mainCategory.update({
            where: { id: categoryId },
            data: { name, description },
          });
          break;

        case "SUB":
          categoryData = await prisma.subCategory.findUnique({
            where: { id: categoryId },
          });
          if (!categoryData) {
            throw new AppError("Sub category not found", "NOT_FOUND");
          }
          // Update Sub Category
          categoryData = await prisma.subCategory.update({
            where: { id: categoryId },
            data: { name, description },
          });
          break;

        case "ITEM":
          categoryData = await prisma.itemCategory.findUnique({
            where: { id: categoryId },
          });
          if (!categoryData) {
            throw new AppError("Item category not found", "NOT_FOUND");
          }
          // Update Item Category
          categoryData = await prisma.itemCategory.update({
            where: { id: categoryId },
            data: { name, description },
          });
          break;

        default:
          throw new AppError("Invalid category type", "BAD_REQUEST");
      }

      return {
        success: true,
        statusCode: 200,
        message: `${
          categoryType.charAt(0).toUpperCase() + categoryType.slice(1)
        } category updated successfully`,
        data: categoryData,
      };
    });
  },

  // deleteCategory: async (
  //   _parent: any,
  //   { id }: { id: string },
  //   { prisma, userInfo }: any
  // ) => {
  //   // Guard to check if the user is an Admin
  //   if (userInfo.role !== UserRole.ADMIN) {
  //     throw new AppError(
  //       "You do not have permission to access this data",
  //       "FORBIDDEN"
  //     );
  //   }

  //   // Check if category exists
  //   const existingCategory = await prisma.category.findUnique({
  //     where: { id },
  //   });

  //   if (!existingCategory) {
  //     throw new AppError("Category not found", "NOT_FOUND");
  //   }

  //   // Delete category from the database
  //   await prisma.category.delete({
  //     where: { id },
  //   });

  //   return {
  //     statusCode: 200,
  //     success: true,
  //     message: "Category deleted successfully",
  //     data: null,
  //   };
  // },
};
