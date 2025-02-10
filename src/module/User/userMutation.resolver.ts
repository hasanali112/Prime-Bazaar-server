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
    //check user already suspended or Deleted
    if (user.status === "SUSPEND" || user.status === "DELETED") {
      throw new AppError("User already suspended or Deleted", "BAD_REQUEST");
    }

    return await prisma.$transaction(
      async (transactionClient: PrismaClient) => {
        if (status === UserStatus.DELETED) {
          // Soft delete by setting status to DELETED
          return await transactionClient.user.update({
            where: { id: userId },
            data: { status: UserStatus.DELETED },
          });
        } else if (status === UserStatus.BLOCKED) {
          return await transactionClient.user.update({
            where: { id: userId },
            data: { status: UserStatus.BLOCKED },
          });
        } else if (status === UserStatus.SUSPENDED) {
          if (!startTime || !endTime) {
            throw new AppError("startTime and endTime required", "BAD_REQUEST");
          }
          // First, update user status
          const updatedUser = await transactionClient.user.update({
            where: { id: userId },
            data: { status: UserStatus.SUSPENDED },
          });

          // Then, create a suspension record
          await transactionClient.suspendedUser.create({
            data: {
              userId,
              startTime: new Date(startTime),
              endTime: new Date(endTime),
            },
          });

          return updatedUser;
        } else {
          throw new AppError("Invalid status update.", "BAD_REQUEST");
        }
      }
    );
  },
};
