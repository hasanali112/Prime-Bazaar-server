/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../error/AppError";
import { handleResolver } from "../../utils/handleResolver";

export const categoryQueryResolver = {
  getAllCategories: async (
    parent: any,
    { page = 1, limit = 10, searchTerm }: any,
    { prisma }: any
  ) => {
    return handleResolver(async () => {
      const skip = (page - 1) * limit;
      const where = searchTerm
        ? { name: { contains: searchTerm, mode: "insensitive" } }
        : {};

      const categories = await prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      const total = await prisma.category.count({ where });

      return {
        statusCode: 200,
        success: true,
        message: "Categories fetched successfully",
        meta: { page, limit, total },
        data: categories,
      };
    });
  },

  category: async (_parent: any, { id }: { id: string }, { prisma }: any) => {
    handleResolver(async () => {
      const category = await prisma.category.findUnique({ where: { id } });

      if (!category) {
        throw new AppError("Category not found", "NOT_FOUND");
      }

      return {
        statusCode: 200,
        success: true,
        message: "Category fetched successfully",
        data: category,
      };
    });
  },
};
