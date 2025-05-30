/* eslint-disable @typescript-eslint/no-explicit-any */

import { Prisma, UserRole } from "@prisma/client";
import AppError from "../../error/AppError";
import { handleResolver } from "../../utils/handleResolver";
import { uploadSingleImageToCloudinary } from "../../utils/upload";

export const categoryMutationResolver = {
  createMainCategory: async (
    _parent: any,
    { input }: { input: { name: string; icon?: File; description?: string } },
    { prisma, userInfo }: any
  ) => {
    return handleResolver(async () => {
      const { name, icon, description } = input;

      // Guard to check if the user is an Admin
      if (userInfo.role !== UserRole.ADMIN) {
        throw new AppError(
          "You are not authorized to perform this action",
          "FORBIDDEN"
        );
      }

      const existingCategory = await prisma.mainCategory.findUnique({
        where: { name: input.name, isDeleted: false },
      });

      if (existingCategory) {
        throw new AppError("Category already exists", "BAD_REQUEST");
      }

      const uploadedImage: any = await uploadSingleImageToCloudinary(
        icon,
        "icon"
      );

      const category = await prisma.mainCategory.create({
        data: {
          name,
          icon: uploadedImage.secure_url,
          description,
        },
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
        where: { id: input.mainCategoryId, isDeleted: false },
      });

      if (!mainCategory) {
        throw new AppError("Main category not found", "NOT_FOUND");
      }

      const existingCategory = await prisma.subCategory.findUnique({
        where: { name: input.name, isDeleted: false },
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
        where: { id: input.subCategoryId, isDeleted: false },
      });

      if (!subCategory) {
        throw new AppError("Sub category not found", "NOT_FOUND");
      }

      const existingCategory = await prisma.itemCategory.findUnique({
        where: { name: input.name, isDeleted: false },
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
      id,
      input,
    }: {
      id: string;
      input: {
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
      const { categoryType, name, description } = input;

      // Initialize update data
      const updateData: { name?: string; description?: string } = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;

      // Initialize category data
      let categoryData: any;

      // Handle dynamic category update logic
      switch (categoryType) {
        case "MAIN":
          categoryData = await prisma.mainCategory.findUnique({
            where: { id },
          });
          if (!categoryData) {
            throw new AppError("Main category not found", "NOT_FOUND");
          }
          categoryData = await prisma.mainCategory.update({
            where: { id },
            data: updateData,
          });
          categoryData.__typename = "MainCategory"; // Add typename
          break;

        case "SUB":
          categoryData = await prisma.subCategory.findUnique({
            where: { id },
          });
          if (!categoryData) {
            throw new AppError("Sub category not found", "NOT_FOUND");
          }
          categoryData = await prisma.subCategory.update({
            where: { id },
            data: updateData,
          });
          categoryData.__typename = "SubCategory"; // Add typename
          break;

        case "ITEM":
          categoryData = await prisma.itemCategory.findUnique({
            where: { id },
          });
          if (!categoryData) {
            throw new AppError("Item category not found", "NOT_FOUND");
          }
          categoryData = await prisma.itemCategory.update({
            where: { id },
            data: updateData,
          });
          categoryData.__typename = "ItemCategory"; // Add typename
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

  deleteMainCategory: async (
    _parent: any,
    { id }: { id: string },
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
        where: { id },
        include: {
          subCategories: {
            include: {
              itemCategories: true,
            },
          },
        },
      });

      if (!mainCategory) {
        throw new AppError("Main category not found", "NOT_FOUND");
      }

      // Start a transaction to ensure all related updates succeed or none do
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // First, update all related item categories
        await tx.itemCategory.updateMany({
          where: {
            subCategoryId: {
              in: mainCategory.subCategories.map((sub: any) => sub.id),
            },
          },
          data: { isDeleted: true },
        });

        // Then update all sub categories
        await tx.subCategory.updateMany({
          where: { mainCategoryId: id },
          data: { isDeleted: true },
        });

        // Finally update the main category
        await tx.mainCategory.update({
          where: { id },
          data: { isDeleted: true },
        });
      });

      return {
        success: true,
        statusCode: 200,
        message:
          "Main category and all related categories marked as deleted successfully",
      };
    });
  },

  deleteSubCategory: async (
    _parent: any,
    { id }: { id: string },
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

      // Check if sub-category exists
      const subCategory = await prisma.subCategory.findUnique({
        where: { id },
        include: {
          itemCategories: true,
        },
      });

      if (!subCategory) {
        throw new AppError("Sub category not found", "NOT_FOUND");
      }

      // Start a transaction to update related records
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // First, update all related item categories
        await tx.itemCategory.updateMany({
          where: { subCategoryId: id },
          data: { isDeleted: true },
        });

        // Then update the sub-category itself
        await tx.subCategory.update({
          where: { id },
          data: { isDeleted: true },
        });
      });

      return {
        success: true,
        statusCode: 200,
        message:
          "Sub category and all related item categories marked as deleted successfully",
      };
    });
  },

  deleteItemCategory: async (
    _parent: any,
    { id }: { id: string },
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

      // Check if item category exists
      const itemCategory = await prisma.itemCategory.findUnique({
        where: { id },
      });

      if (!itemCategory) {
        throw new AppError("Item category not found", "NOT_FOUND");
      }

      // Update the `isDeleted` field instead of deleting
      await prisma.itemCategory.update({
        where: { id },
        data: { isDeleted: true },
      });

      return {
        success: true,
        statusCode: 200,
        message: "Item category marked as deleted successfully",
      };
    });
  },
};
