import { authResolver } from "../../module/auth/auth.resolver";

export const Mutation = {
  ...authResolver,
};
