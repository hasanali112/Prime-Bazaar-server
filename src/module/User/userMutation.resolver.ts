/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import AppError from "../../error/AppError";
import { TUpdateUserStatusType } from "./user.interface";

export const userMutationResolver = {
  updateUserStatus: async (
    parent: any,
    args: TUpdateUserStatusType,
    { prisma, userInfo }: any
  ) => {
    if (userInfo.role !== UserRole.ADMIN) {
      throw new AppError(
        "You do not have permission to access this data",
        "FORBIDDEN"
      );
    }

    const { userId, status, startTime, endTime } = args.input;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("User not found", "NOT_FOUND");
    }

    if (
      user.status === UserStatus.SUSPENDED ||
      user.status === UserStatus.DELETED
    ) {
      throw new AppError("User already suspended or deleted", "BAD_REQUEST");
    }

    const updatedUser = await prisma.$transaction(
      async (transactionClient: PrismaClient) => {
        if (
          status === UserStatus.DELETED ||
          status === UserStatus.BLOCKED ||
          status === UserStatus.SUSPENDED ||
          status === UserStatus.ACTIVE
        ) {
          if (status === UserStatus.SUSPENDED) {
            if (!startTime || !endTime) {
              throw new AppError(
                "startTime and endTime required",
                "BAD_REQUEST"
              );
            }

            const currentTime = new Date();
            const startTimeDate = new Date(startTime);

            if (startTimeDate < currentTime) {
              throw new AppError(
                `startTime must be equal to or later than the current date-time. Current time: ${currentTime.toISOString()}`,
                "BAD_REQUEST"
              );
            }
          }

          const updatedUser = await transactionClient.user.update({
            where: { id: userId },
            data: { status },
          });

          if (user.role === UserRole.VENDOR) {
            await transactionClient.vendor.update({
              where: { userId },
              data: { status },
            });
          } else if (user.role === UserRole.CUSTOMER) {
            await transactionClient.customer.update({
              where: { userId },
              data: { status },
            });
          }

          if (status === UserStatus.SUSPENDED) {
            await transactionClient.suspendedUser.create({
              data: {
                userId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
              },
            });
          }

          return updatedUser;
        } else {
          throw new AppError("Invalid status update.", "BAD_REQUEST");
        }
      }
    );
    return {
      statusCode: 200,
      success: true,
      message: "User status updated successfully",
      data: updatedUser,
    };
  },
};
