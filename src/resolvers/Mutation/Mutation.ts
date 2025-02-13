import { authResolver } from "../../module/auth/auth.resolver";
import { categoryMutationResolver } from "../../module/Category/categoryMutation.resolver";
import { userMutationResolver } from "../../module/User/userMutation.resolver";
export const Mutation = {
  ...authResolver,
  ...userMutationResolver,
  ...categoryMutationResolver,
};
