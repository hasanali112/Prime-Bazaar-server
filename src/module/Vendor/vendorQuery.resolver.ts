/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRole, UserStatus } from "@prisma/client";
import AppError from "../../error/AppError";
import { handleResolver } from "../../utils/handleResolver";

export const vendorQueryResolver = {
  vendors: async (
    parent: any,
    {
      page = 1,
      limit = 10,
      searchTerm,
    }: { page: number; limit: number; searchTerm?: string },
    { prisma, userInfo }: any
  ) => {
    return handleResolver(async () => {
      // Verify user has permission to access vendor data
      if (!userInfo || userInfo.role !== UserRole.ADMIN) {
        throw new AppError(
          "You do not have permission to access this data",
          "FORBIDDEN"
        );
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Build filter criteria
      const filter: any = {
        user: {
          status: {
            not: UserStatus.DELETED,
          },
        },
      };

      // Add search functionality if searchTerm is provided
      if (searchTerm) {
        filter.OR = [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
          { contactNumber: { contains: searchTerm, mode: "insensitive" } },
        ];
      }

      // Get vendors with pagination
      const vendors = await prisma.vendor.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              status: true,
              isVerified: true,
            },
          },
        },
      });

      // Get total count for pagination metadata
      const totalCount = await prisma.vendor.count({ where: filter });

      return {
        statusCode: 200,
        success: true,
        message: "Vendors fetched successfully",
        data: vendors,
        meta: {
          page,
          limit,
          total: totalCount,
        },
      };
    });
  },

  getSingleVendor: async (
    parent: any,
    { id }: { id: string },
    { prisma, userInfo }: any
  ) => {
    return handleResolver(async () => {
      // Check if user has permission
      if (
        !userInfo ||
        (userInfo.role !== UserRole.ADMIN &&
          userInfo.userId !==
            (await prisma.vendor.findUnique({ where: { id } }))?.userId)
      ) {
        throw new AppError(
          "You do not have permission to access this data",
          "FORBIDDEN"
        );
      }

      // Find the vendor
      const vendor = await prisma.vendor.findUnique({
        where: { id },
        include: {
          shop: {
            include: {
              products: {
                take: 5,
                orderBy: {
                  createdAt: "desc",
                },
                include: {
                  variants: true,
                  itemCategory: true,
                },
              },
              coupons: {
                where: {
                  isActive: true,
                  endDate: {
                    gt: new Date(),
                  },
                },
                take: 5,
              },
            },
          },
        },
      });

      if (!vendor) {
        throw new AppError("Vendor not found", "NOT_FOUND");
      }

      return {
        statusCode: 200,
        success: true,
        message: "Vendor fetched successfully",
        data: vendor,
      };
    });
  },
};
