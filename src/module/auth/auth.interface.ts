import { Gender, PrismaClient, UserRole } from "@prisma/client";
import { IncomingMessage, ServerResponse } from "http";

export type TPrisma = {
  prisma: PrismaClient;
  res: any;
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

export type TLoginType = {
  input: {
    email: string;
    password: string;
  };
};
