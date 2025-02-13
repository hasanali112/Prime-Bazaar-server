/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { IncomingMessage, ServerResponse } from "http";
import { jwtHelper } from "./helper/jwtHelper";
import config from "./config";
import { JwtPayload } from "jsonwebtoken";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express, { Application } from "express";
import http from "http";
import cors from "cors";
import { graphqlUploadExpress } from "graphql-upload-minimal";

const prisma = new PrismaClient();

interface Context {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
  req: IncomingMessage;
  res: ServerResponse<IncomingMessage>;
  userInfo: JwtPayload | null;
}

const app: Application = express();
const httpServer = http.createServer(app);

async function main() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: false,
    formatError: (formattedError, error: any) => {
      // console.log("GraphQL Error:", error);
      return globalErrorHandler(error);
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  // Middleware order is important
  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );

  app.use(graphqlUploadExpress());

  // Parse URL-encoded bodies (as sent by HTML forms)
  app.use(express.urlencoded({ extended: true }));

  // Parse JSON bodies (as sent by API clients)
  app.use(express.json());

  //apolo server
  app.use(
    "/",

    expressMiddleware(server, {
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
            console.log(error);
            console.warn("Invalid token, proceeding without authentication.");
          }
        }

        return {
          prisma,
          userInfo,
          req,
          res,
        };
      },
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );

  console.log(`🚀 Multi Vendor Server ready at: http://localhost:4000`);
}

main().catch((err) => {
  console.error("Failed to start the server:", err);
});
