import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function generateUniqueId(name: string) {
  const userName = name.replace(" ", "").toLowerCase();
  const random = Math.random().toFixed(2).replace("0.", "");
  return `${userName}${random}`;
}

const createAdmin = async (payload: any) => {
  const hasPassword = await bcrypt.hash(payload.password, 10);
  const userData = {
    userId: generateUniqueId(payload.admin.name),
    email: payload.admin.email,
    password: hasPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transcationClient) => {
    await transcationClient.user.create({
      data: userData,
    });
    const admin = await transcationClient.admin.create({
      data: {
        userId: userData.userId,
        ...payload.admin,
      },
    });
    return admin;
  });

  return result;
};

export const UserService = {
  createAdmin,
};
