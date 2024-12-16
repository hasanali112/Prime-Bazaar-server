import { Prisma } from "@prisma/client";
import prisma from "../shared/prisma";

const getAdminFromDB = async (params: any) => {
  const { searchTerm, ...filterData } = params;

  const addCondition: Prisma.AdminWhereInput[] = [];

  const searchableField = ["name", "email"];

  if (searchTerm) {
    addCondition.push({
      OR: searchableField.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    addCondition.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  const whereCondition: Prisma.AdminWhereInput = { AND: addCondition };

  const result = await prisma.admin.findMany({
    where: whereCondition,
  });

  return result;
};

export const AdminService = {
  getAdminFromDB,
};
