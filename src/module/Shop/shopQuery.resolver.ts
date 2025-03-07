/* eslint-disable @typescript-eslint/no-explicit-any */

import { UserRole } from "@prisma/client";
import AppError from "../../error/AppError";

export const shopQueryResolver = {
  getAllShops: async (
    parent: any,
    {
      page = 1,
      limit = 10,
      status,
      searchTerm,
    }: {
      page?: number;
      limit?: number;
      status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "DELETED";
      searchTerm?: string;
    },
    { prisma }: any
  ) => {
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build filter conditions
    const whereConditions: any = {
      isDeleted: false,
    };

    if (status) {
      whereConditions.status = status;
    }

    if (searchTerm) {
      whereConditions.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.shop.count({
      where: whereConditions,
    });

    // Get shops with pagination
    const shops = await prisma.shop.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        vendor: true,
        products: {
          where: {
            isDeleted: false,
          },
          take: 5,
        },
      },
    });

    // Calculate pagination metadata
    // const totalPages = Math.ceil(total / limit);

    return {
      statusCode: 200,
      success: true,
      message: "Shops retrieved successfully",
      meta: {
        page,
        limit,
        total,
      },
      data: shops,
    };
  },

  getShop: async (parent: any, { id }: { id: string }, { prisma }: any) => {
    // Find the shop by ID
    const shop = await prisma.shop.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        vendor: true,
        products: {
          where: {
            isDeleted: false,
          },
        },
      },
    });

    if (!shop) {
      throw new AppError("Shop not found", "NOT_FOUND");
    }

    return {
      statusCode: 200,
      success: true,
      message: "Shop retrieved successfully",
      data: shop,
    };
  },

  // Get the current vendor's shop
  getMyShop: async (parent: any, args: any, { prisma, userInfo }: any) => {
    // Check if user is authenticated
    if (!userInfo || !userInfo.userId) {
      throw new AppError("Authentication required", "UNAUTHORIZED");
    }

    // Check if user is a vendor
    if (userInfo.role !== UserRole.VENDOR) {
      throw new AppError("Only vendors can access their shop", "FORBIDDEN");
    }

    // Get vendor information
    const user = await prisma.user.findUnique({
      where: { id: userInfo.userId },
      include: { vendor: true },
    });

    if (!user || !user.vendor) {
      throw new AppError("Vendor profile not found", "NOT_FOUND");
    }

    // Find the vendor's shop
    const shop = await prisma.shop.findUnique({
      where: {
        vendorId: user.vendor.id,
        isDeleted: false,
      },
      include: {
        products: {
          where: {
            isDeleted: false,
          },
        },
      },
    });

    if (!shop) {
      throw new AppError("Shop not found", "NOT_FOUND");
    }

    return {
      statusCode: 200,
      success: true,
      message: "Shop retrieved successfully",
      data: shop,
    };
  },
};
