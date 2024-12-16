import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function generateUniqueId(prefix: string) {
  const random = Math.random().toFixed(2).replace("0.", "");
  return `${prefix}${random}`;
}

const createAdmin = async (payload: any) => {
  const hasPassword = await bcrypt.hash(payload.password, 10);
  const userData = {
    userId: generateUniqueId(payload.name),
    email: payload.admin.email,
    password: hasPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transcationClient) => {
    await transcationClient.user.create({
      data: userData,
    });
    const admin = await transcationClient.admin.create({
      data: payload.admin,
    });
    return admin;
  });

  console.log(userData);

  return result;
};

export const UserService = {
  createAdmin,
};
