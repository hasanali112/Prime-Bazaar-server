import { GraphQLError } from "graphql";

class AppError extends GraphQLError {
  constructor(message: string, code: string, extensions?: Record<string, any>) {
    super(message, {
      extensions: {
        code,
        ...extensions,
      },
    });
  }
}

export default AppError;
