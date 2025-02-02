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
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req, res }): Promise<Context> => {
      const userInfo = jwtHelper.verifyToken(
        req.headers.authorization as string,
        config.access_secret as string
      );
      return {
        prisma,
        userInfo,
        req,
        res,
      };
    },
  });

  console.log(`🚀  Multi Vendor Server ready at: ${url}`);
};

server();
