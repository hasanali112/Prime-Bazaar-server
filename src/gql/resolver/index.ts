import { authResolver } from "../../module/auth.resolver";

export const resolvers = {
  Query: {},
  Mutation: {
    ...authResolver,
  },
};
