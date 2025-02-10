import { authResolver } from "../../module/auth/auth.resolver";
import { userMutationResolver } from "../../module/User/userMutation.resolver";

export const Mutation = {
  ...authResolver,
  ...userMutationResolver,
};
