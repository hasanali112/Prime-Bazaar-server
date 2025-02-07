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
};
