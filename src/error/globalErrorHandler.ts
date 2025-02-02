import { GraphQLError } from "graphql";
import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { handlePrismaError } from "./handlePrismaError";
import { handleValidationError } from "./handleValidationError";
import { TErrorResponse } from "./error.interface";
import AppError from "./AppError";

export const globalErrorHandler = (error: Error): GraphQLError => {
  let errorResponse: TErrorResponse = {
    success: false,
    statusCode: httpStatus.INTERNAL_SERVER_ERROR as number,
    message: "Internal server error",
    errorMessages: [
      {
        path: "server",
        message: error.message,
      },
    ],
  };

  // Handle different types of errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    errorResponse = handlePrismaError(error);
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    errorResponse = handleValidationError(error);
  } else if (error instanceof AppError) {
    errorResponse = {
      success: false,
      statusCode:
        (error.extensions?.statusCode as number) ||
        httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message,
      errorMessages: [
        {
          path: (error.extensions?.path as string) || "custom",
          message: error.message,
        },
      ],
    };
  } else if (error instanceof GraphQLError) {
    errorResponse = {
      success: false,
      statusCode:
        (error.extensions?.statusCode as number) ||
        httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message,
      errorMessages: [
        {
          path: (error.extensions?.path as string) || "graphql",
          message: error.message,
        },
      ],
    };
  }

  // Add stack trace in development environment
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = error.stack;
  }

  // Convert to GraphQLError format
  return new GraphQLError(errorResponse.message, {
    extensions: {
      success: errorResponse.success,
      statusCode: errorResponse.statusCode,
      errorMessages: errorResponse.errorMessages,
      stack: errorResponse.stack,
    },
  });
};
