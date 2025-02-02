import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { TErrorResponse } from "./error.interface";

export const handlePrismaError = (
  error: Prisma.PrismaClientKnownRequestError
): TErrorResponse => {
  let message = "";
  let statusCode = httpStatus.INTERNAL_SERVER_ERROR as number;
  switch (error.code) {
    case "P2002":
      message = "Duplicate entry found";
      statusCode = httpStatus.CONFLICT;
      break;
    case "P2025":
      message = "Record not found";
      statusCode = httpStatus.NOT_FOUND;
      break;
    case "P2003":
      message = "Foreign key constraint failed";
      statusCode = httpStatus.BAD_REQUEST;
      break;
    default:
      message = "Database error occurred";
  }

  return {
    success: false,
    statusCode,
    message,
    errorMessages: [
      {
        path: (error.meta?.target as string) || "database",
        message,
      },
    ],
  };
};
