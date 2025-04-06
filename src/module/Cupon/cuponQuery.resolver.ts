/* eslint-disable @typescript-eslint/no-explicit-any */
// coupon.resolver.ts
import { Prisma } from "@prisma/client";
import AppError from "../../error/AppError";
import { handleResolver } from "../../utils/handleResolver";
import pick from "../../utils/pick";
import { calculatePagination } from "../../helper/paginationHelper";
import { couponFilterFields, couponSearchableFileds } from "./cupon.constant";
import { buildSearchFilterUtilityCondition } from "../../utils/BuildSearchFilterUtility";

export const couponQueryResolver = {
  getAllCoupons: async (
    parent: any,
    { filters }: { filters: any },
    { prisma }: any
  ) => {
    return handleResolver(async () => {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        ...filterData
      } = filters || {};

      const { searchTerm, ...otherFilters } = pick(
        filterData,
        couponFilterFields
      );
      const { skip } = calculatePagination({ page, limit });

      const andConditions: Prisma.CouponWhereInput[] = [];

      // Search functionality
      if (searchTerm) {
        andConditions.push({
          OR: couponSearchableFileds.map((field) =>
            buildSearchFilterUtilityCondition(field, searchTerm)
          ),
        });
      }

      // Add other filters
      if (Object.keys(otherFilters).length > 0) {
        andConditions.push({
          AND: Object.keys(otherFilters).map((key) => ({
            [key]: {
              equals: otherFilters[key],
            },
          })),
        });
      }

      const where: Prisma.CouponWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

      // Determine sort order
      let orderBy: Prisma.CouponOrderByWithRelationInput = {};
      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        orderBy[sortBy as keyof Prisma.CouponOrderByWithRelationInput] =
          sortOrder;
      } else if (sortBy === "discountValue") {
        orderBy = { discountValue: sortOrder };
      } else if (sortBy === "startDate") {
        orderBy = { startDate: sortOrder };
      } else if (sortBy === "endDate") {
        orderBy = { endDate: sortOrder };
      }

      const [coupons, total] = await Promise.all([
        prisma.coupon.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            shop: true,
            products: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        }),
        prisma.coupon.count({ where }),
      ]);

      return {
        statusCode: 200,
        success: true,
        message: "Coupons fetched successfully",
        meta: {
          page,
          limit,
          total,
        },
        data: coupons,
      };
    });
  },

  getCoupon: async (parent: any, { id }: { id: string }, { prisma }: any) => {
    return handleResolver(async () => {
      const coupon = await prisma.coupon.findUnique({
        where: { id },
        include: {
          shop: {
            include: {
              vendor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              stockQuantity: true,
              status: true,
            },
          },
        },
      });

      if (!coupon) {
        throw new AppError("Coupon not found", "NOT_FOUND");
      }

      return {
        statusCode: 200,
        success: true,
        message: "Coupon fetched successfully",
        data: coupon,
      };
    });
  },

  getMyShopCoupons: async (
    parent: any,
    {
      page = 1,
      limit = 10,
      isActive,
    }: { page?: number; limit?: number; isActive?: boolean },
    { prisma, userInfo }: any
  ) => {
    return handleResolver(async () => {
      // Verify user is a vendor
      if (userInfo.role !== "VENDOR") {
        throw new AppError("Only vendors can access shop coupons", "FORBIDDEN");
      }

      const { skip } = calculatePagination({ page, limit });

      // Get vendor's shop
      const vendor = await prisma.vendor.findUnique({
        where: { userId: userInfo.userId },
        select: { shop: true },
      });

      if (!vendor || !vendor.shop) {
        throw new AppError("Vendor or shop not found", "NOT_FOUND");
      }

      const where: Prisma.CouponWhereInput = {
        shopId: vendor.shop.id,
      };

      // Filter by active status if provided
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const [coupons, total] = await Promise.all([
        prisma.coupon.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            products: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        prisma.coupon.count({ where }),
      ]);

      return {
        statusCode: 200,
        success: true,
        message: "Shop coupons fetched successfully",
        meta: {
          page,
          limit,
          total,
        },
        data: coupons,
      };
    });
  },
};
