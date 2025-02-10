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

    // Check if user is already suspended or deleted
    if (
      user.status === UserStatus.SUSPENDED ||
      user.status === UserStatus.DELETED
    ) {
      throw new AppError("User already suspended or deleted", "BAD_REQUEST");
    }

    return await prisma.$transaction(
      async (transactionClient: PrismaClient) => {
        if (status === UserStatus.DELETED) {
          // Soft delete by setting status to DELETED
          const updatedUser = await transactionClient.user.update({
            where: { id: userId },
            data: { status: UserStatus.DELETED },
          });

          if (user.role === UserRole.VENDOR) {
            await transactionClient.vendor.update({
              where: { userId: userId },
              data: { status: UserStatus.DELETED },
            });
          } else if (user.role === UserRole.CUSTOMER) {
            await transactionClient.customer.update({
              where: { userId: userId },
              data: { status: UserStatus.DELETED },
            });
          }

          return updatedUser;
        } else if (status === UserStatus.BLOCKED) {
          // Block user
          const updatedUser = await transactionClient.user.update({
            where: { id: userId },
            data: { status: UserStatus.BLOCKED },
          });

          if (user.role === UserRole.VENDOR) {
            await transactionClient.vendor.update({
              where: { userId: userId },
              data: { status: UserStatus.BLOCKED },
            });
          } else if (user.role === UserRole.CUSTOMER) {
            await transactionClient.customer.update({
              where: { userId: userId },
              data: { status: UserStatus.BLOCKED },
            });
          }

          return updatedUser;
        } else if (status === UserStatus.SUSPENDED) {
          if (!startTime || !endTime) {
            throw new AppError("startTime and endTime required", "BAD_REQUEST");
          }

          const currentTime = new Date();
          const startTimeDate = new Date(startTime);
          const endTimeDate = new Date(endTime);

          // Ensure startTime is equal to or later than the current date-time
          if (startTimeDate < currentTime) {
            throw new AppError(
              `startTime must be equal to or later than the current date-time. Current time: ${currentTime.toISOString()}`,
              "BAD_REQUEST"
            );
          }

          // Suspend user
          const updatedUser = await transactionClient.user.update({
            where: { id: userId },
            data: { status: UserStatus.SUSPENDED },
          });

          if (user.role === UserRole.VENDOR) {
            await transactionClient.vendor.update({
              where: { userId: userId },
              data: { status: UserStatus.SUSPENDED },
            });
          } else if (user.role === UserRole.CUSTOMER) {
            await transactionClient.customer.update({
              where: { userId: userId },
              data: { status: UserStatus.SUSPENDED },
            });
          }

          // Create a suspension record
          await transactionClient.suspendedUser.create({
            data: {
              userId,
              startTime: startTimeDate,
              endTime: endTimeDate,
            },
          });

          return updatedUser;
        } else if (status === UserStatus.ACTIVE) {
          // Activate user
          const updatedUser = await transactionClient.user.update({
            where: { id: userId },
            data: { status: UserStatus.ACTIVE },
          });

          if (user.role === UserRole.VENDOR) {
            await transactionClient.vendor.update({
              where: { userId },
              data: { status: UserStatus.ACTIVE },
            });
          } else if (user.role === UserRole.CUSTOMER) {
            await transactionClient.customer.update({
              where: { userId },
              data: { status: UserStatus.ACTIVE },
            });
          }

          return updatedUser;
        } else {
          throw new AppError("Invalid status update.", "BAD_REQUEST");
        }
      }
    );
  },
};
