/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRole, UserStatus } from "@prisma/client";
import AppError from "../../error/AppError";
import { handleResolver } from "../../utils/handleResolver";

export const customerQueryResolver = {
  customers: async (
    parent: any,
    {
      page = 1,
      limit = 10,
      searchTerm,
    }: { page: number; limit: number; searchTerm?: string },
    { prisma, userInfo }: any
  ) => {
    return handleResolver(async () => {
      // Verify user has permission to access customer data
      if (
        !userInfo ||
        (userInfo.role !== UserRole.ADMIN && userInfo.role !== UserRole.VENDOR)
      ) {
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

      // Get customers with pagination
      const customers = await prisma.customer.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              status: true,
              email: true,
            },
          },
          //   orders: {
          //     select: {
          //       id: true,
          //       orderNumber: true,
          //       orderStatus: true,
          //       totalAmount: true
          //     },
          //     orderBy: {
          //       createdAt: 'desc'
          //     },
          //     take: 5 // Include the 5 most recent orders
          //   }
        },
      });

      // Get total count for pagination metadata
      const totalCount = await prisma.customer.count({ where: filter });

      return {
        statusCode: 200,
        success: true,
        message: "Customers fetched successfully",
        data: customers,
        meta: {
          page,
          limit,
          total: totalCount,
        },
      };
    });
  },

  getSingleCustomer: async (
    parent: any,
    { id }: { id: string },
    { prisma, userInfo }: any
  ) => {
    return handleResolver(async () => {
      // Check if user has permission
      if (
        !userInfo ||
        (userInfo.role !== UserRole.ADMIN &&
          userInfo.role !== UserRole.VENDOR &&
          userInfo.userId !==
            (await prisma.customer.findUnique({ where: { id } }))?.userId)
      ) {
        throw new AppError(
          "You do not have permission to access this data",
          "FORBIDDEN"
        );
      }

      // Find the customer
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              status: true,
              role: true,
              createdAt: true,
            },
          },
          orders: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              orderItems: true,
              payment: true,
            },
          },
        },
      });

      if (!customer) {
        throw new AppError("Customer not found", "NOT_FOUND");
      }

      return {
        statusCode: 200,
        success: true,
        message: "Customer fetched successfully",
        data: customer,
      };
    });
  },
};
