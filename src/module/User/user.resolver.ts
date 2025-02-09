import { UserRole } from "@prisma/client";
import AppError from "../../error/AppError";

export const userResolver = {
  me: async (parent: any, args: any, { prisma, userInfo }: any) => {
    if (!userInfo) {
      throw new AppError("Authentication required", "UNAUTHORIZED");
    }

    const user = await prisma.user.findUnique({
      where: { id: userInfo.userId },
      include: {
        Admin: true,
        Vendor: true,
        Customer: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", "NOT_FOUND");
    }

    let profileInfo;
    if (userInfo.role === UserRole.ADMIN) {
      profileInfo = await prisma.admin.findUnique({
        where: {
          id: userInfo.id,
        },
      });
    } else if (userInfo.role === UserRole.VENDOR) {
      profileInfo = await prisma.admin.findUnique({
        where: {
          id: userInfo.id,
        },
      });
    } else if (userInfo.role === UserRole.CUSTOMER) {
      profileInfo = await prisma.doctor.findUnique({
        where: {
          email: userInfo.email,
        },
      });
    }

    return { ...userInfo, ...profileInfo };
  },

  getAllUsers: async (
    parent: any,
    { page = 1, limit = 10, role, status, searchTerm }: any,
    { prisma, userInfo }: any
  ) => {
    // console.log("page", page, "limit:", limit, "searchTerm:", searchTerm);
    // console.log("userInfo.role:", userInfo.role);
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
      const total = await prisma.user.count({ where: filter });

      return {
        meta: {
          page,
          limit,
          total,
        },
        data: users,
      };
    } catch (error) {
      console.log("Error fetching users:", error);
      throw new AppError("Error fetching users", "INTERNAL_SERVER_ERROR");
    }
  },
};
