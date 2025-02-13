/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRole, UserStatus } from "@prisma/client";
import AppError from "../../error/AppError";

export const userQueryResolver = {
  me: async (parent: any, args: any, { prisma, userInfo }: any) => {
    if (!userInfo) {
      throw new AppError("Authentication required", "UNAUTHORIZED");
    }

    const user = await prisma.user.findUnique({
      where: { id: userInfo.userId },
      include: {
        admin: true,
        vendor: true,
        customer: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", "NOT_FOUND");
    }

    if (
      user.status === UserStatus.SUSPENDED ||
      user.status === UserStatus.DELETED
    ) {
      throw new AppError("User already suspended or deleted", "BAD_REQUEST");
    }
    let profileInfo;
    if (userInfo.role === UserRole.ADMIN) {
      profileInfo = await prisma.admin.findUnique({
        where: {
          userId: user.id,
        },
      });
    } else if (userInfo.role === UserRole.VENDOR) {
      profileInfo = await prisma.admin.findUnique({
        where: {
          userId: user.id,
        },
      });
    } else if (userInfo.role === UserRole.CUSTOMER) {
      profileInfo = await prisma.doctor.findUnique({
        where: {
          userId: user.id,
        },
      });
    }
    return {
      statusCode: 200,
      success: true,
      message: "User profile fetched successfully",
      data: { ...user, ...profileInfo },
    };
  },

  getAllUsers: async (
    parent: any,
    { page = 1, limit = 10, role, status, searchTerm }: any,
    { prisma, userInfo }: any
  ) => {
    // Guard to check if the user is an Admin
    if (userInfo.role !== UserRole.ADMIN) {
      throw new AppError(
        "You do not have permission to access this data",
        "FORBIDDEN"
      );
    }

    // Calculate pagination offset
    const skip = (page - 1) * limit;

    // Build filter criteria
    const filter: any = {};

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    if (searchTerm) {
      filter.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
        { contactNumber: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    try {
      // Get the paginated data
      const users = await prisma.user.findMany({
        where: filter,
        skip,
        take: limit,
        include: {
          admin: true, // Include related admin data if exists
          vendor: true, // Include related vendor data if exists
          customer: true, // Include related customer data if exists
        },
      });

      // Get the total count of users matching the filter
      const totalCount = await prisma.user.count({ where: filter });

      return {
        statusCode: 200,
        success: true,
        message: "Users fetched successfully",
        data: users,
        meta: {
          page: page || 1,
          limit: limit || 10,
          total: totalCount,
        },
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new AppError("Error fetching users", "INTERNAL_SERVER_ERROR");
    }
  },
};
