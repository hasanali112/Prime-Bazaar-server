import { Prisma } from "@prisma/client";

import httpStatus from "http-status";
import { TErrorResponse } from "./error.interface";

export const handleValidationError = (
  error: Prisma.PrismaClientValidationError
): TErrorResponse => {
  return {
    success: false,
    statusCode: httpStatus.BAD_REQUEST,
    message: "Validation Error",
    errorMessages: [
      {
        path: "validation",
        message: error.message,
      },
    ],
  };
};
