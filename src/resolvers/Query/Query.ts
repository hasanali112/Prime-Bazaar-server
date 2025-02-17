import { categoryQueryResolver } from "../../module/Category/categoryQuery.resolver";
import { userQueryResolver } from "../../module/User/userQuery.resolver";

export const Query = {
  ...userQueryResolver,
  ...categoryQueryResolver,
};
