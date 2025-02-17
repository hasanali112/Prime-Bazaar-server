// export const typeDefs = `#graphql
//   # Add Upload scalar
//    scalar Upload

import { AdminTypeDefs } from "./module/Admin/admin.typeDefs";
import { AuthTypeDefs } from "./module/auth/auth.typeDefs";
import { CategoryTypeDefs } from "./module/Category/category.typeDefs";
import { CustomerTypeDefs } from "./module/Customer/customer.typeDefs";
import { UserTypeDefs } from "./module/User/user.typeDefs";
import { VendorTypeDefs } from "./module/Vendor/vendor.typeDefs";
import { BaseTypeDefs } from "./utilityTypeDefs/base.typeDefs";

export const typeDefs = `#graphql
  ${BaseTypeDefs}
  ${AuthTypeDefs}
  ${UserTypeDefs}
  ${AdminTypeDefs}
  ${VendorTypeDefs}
  ${CustomerTypeDefs}
  ${CategoryTypeDefs}
`;
