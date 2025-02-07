import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { IncomingMessage, ServerResponse } from "http";
import { jwtHelper } from "./helper/jwtHelper";
import config from "./config";
import { JwtPayload } from "jsonwebtoken";

import { globalErrorHandler } from "./middleware/globalErrorHandler";

const prisma = new PrismaClient();

interface Context {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
  req: IncomingMessage;
  res: ServerResponse<IncomingMessage>;
  userInfo: JwtPayload | null;
}

const server = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // introspection: process.env.NODE_ENV !== "production",
    formatError: (formattedError, error: any) => {
      const handledError = globalErrorHandler(error);
      return handledError;
    },
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },

    context: async ({ req, res }): Promise<Context> => {
      let userInfo: JwtPayload | null = null;

      // Handle missing or invalid token safely
      const authHeader = req.headers.authorization;
      if (authHeader) {
        try {
          userInfo = jwtHelper.verifyToken(
            authHeader,
            config.access_secret as string
          );
        } catch (error) {
          console.warn("Invalid token, proceeding without authentication.");
        }
      }

      return {
        prisma,
        userInfo, // Can be null if authentication fails
        req,
        res,
      };
    },
  });

  console.log(`🚀  Multi Vendor Server ready at: ${url}`);
};

server();
