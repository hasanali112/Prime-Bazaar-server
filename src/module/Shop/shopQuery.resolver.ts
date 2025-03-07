/* eslint-disable @typescript-eslint/no-explicit-any */

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
};
