/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../error/AppError";

export const categoryQueryResolver = {
  getAllCategories: async (
    parent: any,
    { page = 1, limit = 10, searchTerm }: any,
    { prisma }: any
  ) => {
    try {
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
        data: categories,
        meta: { page, limit, total },
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return {
        statusCode: 500,
        success: false,
        message: "Error fetching categories",
        data: [],
      };
    }
  },

  category: async (_parent: any, { id }: { id: string }, { prisma }: any) => {
    try {
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
    } catch (error) {
      console.error("Error fetching category:", error);
      return {
        statusCode: 500,
        success: false,
        message: "Error fetching category",
        data: null,
      };
    }
  },
};
