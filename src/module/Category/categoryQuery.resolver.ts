/* eslint-disable @typescript-eslint/no-explicit-any */

import { Prisma } from "@prisma/client";
import { handleResolver } from "../../utils/handleResolver";
import AppError from "../../error/AppError";

export const categoryQueryResolver = {
  mainCategories: async (
    parent: any,
    { page = 1, limit = 10, searchTerm }: any,
    { prisma }: any
  ) => {
    return handleResolver(async () => {
      const skip = (page - 1) * limit;
      const andConditions: Prisma.MainCategoryWhereInput[] = [];
      if (searchTerm) {
        andConditions.push({
          OR: [{ name: { contains: searchTerm, mode: "insensitive" } }],
        });
      }

      andConditions.push({
        isDeleted: false,
      });

      const whereConditions: Prisma.MainCategoryWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

      const mainCategories = await prisma.mainCategory.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          subCategories: {
            include: {
              itemCategories: true,
            },
          },
        },
      });

      const total = await prisma.mainCategory.count({ where: whereConditions });

      return {
        statusCode: 200,
        success: true,
        message: "Main categories fetched successfully",
        meta: { page, limit, total },
        data: mainCategories,
      };
    });
  },

  mainCategory: async (
    _parent: any,
    { id }: { id: string },
    { prisma }: any
  ) => {
    return handleResolver(async () => {
      const mainCategory = await prisma.mainCategory.findUnique({
        where: { id },
        include: {
          subCategories: {
            include: {
              itemCategories: true, // Fetch related item categories
            },
          },
        },
      });

      if (!mainCategory) {
        throw new AppError("Main category not found", "NOT_FOUND");
      }

      return {
        statusCode: 200,
        success: true,
        message: "Main category fetched successfully",
        data: mainCategory,
      };
    });
  },

  // Fetch all subcategories for a specific main category
  subCategories: async (
    parent: any,
    { page = 1, limit = 10, searchTerm }: any,
    { prisma }: any
  ) => {
    return handleResolver(async () => {
      const skip = (page - 1) * limit;
      const andConditions: Prisma.SubCategoryWhereInput[] = [];
      if (searchTerm) {
        andConditions.push({
          OR: [{ name: { contains: searchTerm, mode: "insensitive" } }],
        });
      }

      andConditions.push({
        isDeleted: false,
      });

      const whereConditions: Prisma.SubCategoryWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

      const subCategories = await prisma.subCategory.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          itemCategories: true, // Include item categories in the response
        },
      });

      const total = await prisma.subCategory.count({ where: whereConditions });

      return {
        statusCode: 200,
        success: true,
        message: "Subcategories fetched successfully",
        meta: { page, limit, total },
        data: subCategories,
      };
    });
  },
};
