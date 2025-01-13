import { Gender, PrismaClient, UserRole } from "@prisma/client";

export type TPrisma = {
  prisma: PrismaClient;
};

export type TUserType = {
  input: {
    email: string;
    password: string;
    role: UserRole;
    name: string;
    contactNumber: string;
    emergencyContactNumber: string;
    gender: Gender;
    address: string;
  };
};
