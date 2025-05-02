import { categoryQueryResolver } from "../../module/Category/categoryQuery.resolver";
import { customerQueryResolver } from "../../module/Customer/customerQuery.resolver";
import { productQueryResolver } from "../../module/Product/productQuery.resolver";
import { userQueryResolver } from "../../module/User/userQuery.resolver";

export const Query = {
  ...userQueryResolver,
  ...categoryQueryResolver,
  ...productQueryResolver,
  ...customerQueryResolver,
};
