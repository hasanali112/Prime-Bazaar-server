/* eslint-disable @typescript-eslint/no-explicit-any */

import { Prisma } from "@prisma/client";
import { handleResolver } from "../../utils/handleResolver";

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
};
