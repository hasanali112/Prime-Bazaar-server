import { authResolver } from "../../module/auth/auth.resolver";

export const resolvers = {
  Query: {},
  Mutation: {
    ...authResolver,
  },
};
