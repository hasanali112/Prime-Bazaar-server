/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, ProductStatus } from "@prisma/client";
import { handleResolver } from "../../utils/handleResolver";
import pick from "../../utils/pick";
import {
  productFilterFields,
  productSearchableFileds,
} from "./product.constant";
import { calculatePagination } from "../../helper/paginationHelper";

type SortOrder =
  | "ASC"
  | "DESC"
  | "LOW_TO_HIGH"
  | "HIGH_TO_LOW"
  | "NEWEST"
  | "OLDEST";

export const productQueryResolver = {
  getAllProducts: async (
    _parent: any,
    args: {
      filters?: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: SortOrder;
        minPrice?: number;
        maxPrice?: number;
        brand?: string;
        itemCategoryId?: string;
        isFlashSale?: boolean;
        status?: ProductStatus;
        searchTerm?: string;
      };
    },
    { prisma }: any
  ) => {
    return handleResolver(async () => {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "DESC",
        ...filters
      } = args.filters || {};

      const filterData = pick(filters, productFilterFields);
      const { searchTerm, ...otherFilters } = filterData;

      const { skip } = calculatePagination({ page, limit, sortBy, sortOrder });

      const andConditions: Prisma.ProductWhereInput[] = [];

      if (searchTerm) {
        andConditions.push({
          OR: productSearchableFileds.map((field) => ({
            [field]: {
              contains: searchTerm,
              mode: "insensitive",
            },
          })),
        });
      }

      if (Object.keys(otherFilters).length > 0) {
        andConditions.push({
          AND: Object.entries(otherFilters).map(([field, value]) => ({
            [field]: value,
          })),
        });
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        andConditions.push({
          price: {
            gte: filters.minPrice,
            lte: filters.maxPrice,
          },
        });
      }

      const whereConditions: Prisma.ProductWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

      let orderBy: Prisma.ProductOrderByWithRelationInput = {
        [sortBy]: sortOrder.toLowerCase(),
      };

      if (sortOrder === "LOW_TO_HIGH") {
        orderBy = { price: "asc" };
      } else if (sortOrder === "HIGH_TO_LOW") {
        orderBy = { price: "desc" };
      } else if (sortOrder === "NEWEST") {
        orderBy = { createdAt: "desc" };
      } else if (sortOrder === "OLDEST") {
        orderBy = { createdAt: "asc" };
      }

      const products = await prisma.product.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy,
        include: {
          variants: true,
          shop: true,
          itemCategory: true,
          coupon: true,
        },
      });

      const total = await prisma.product.count({
        where: whereConditions,
      });

      const meta = {
        page,
        limit,
        total,
      };

      return {
        statusCode: 200,
        success: true,
        message: "Products fetched successfully",
        meta,
        data: products,
      };
    });
  },
};
