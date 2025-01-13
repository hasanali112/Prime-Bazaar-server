import { UserRole } from "@prisma/client";
import { GraphQLError } from "graphql";
import { TPrisma, TUserType } from "./auth.interface";

export const authResolver = {
  userSignUp: async (_parant: any, args: TUserType, { prisma }: TPrisma) => {
    const userData = args.input;
    const userSignUpData = {
      email: userData.email,
      password: userData.password,
      role: userData.role,
    };

    const sepicificUser = {
      name: userData.name,
      email: userData.email,
      contactNumber: userData.contactNumber,
      emergencyContactNumber: userData.emergencyContactNumber,
      gender: userData.gender,
      address: userData.address,
    };

    try {
      const result = await prisma.$transaction(async (transactionClient) => {
        const createUser = await transactionClient.user.create({
          data: userSignUpData,
        });

        //admin create
        if (userData.role === UserRole.ADMIN) {
          await transactionClient.admin.create({
            data: {
              userId: createUser.id,
              ...sepicificUser,
            },
          });
        }
        //vendor create
        else if (userData.role === UserRole.VENDOR) {
          await transactionClient.vendor.create({
            data: {
              userId: createUser.id,
              ...sepicificUser,
            },
          });
        }
        //customer create
        else if (userData.role === UserRole.CUSTOMER) {
          await transactionClient.customer.create({
            data: {
              userId: createUser.id,
              ...sepicificUser,
            },
          });
        }
        return createUser;
      });

      return result;
    } catch (error) {
      throw new GraphQLError("User sign up failed", {
        extensions: {
          code: "BAD_REQUEST",
          errorDetails: error,
        },
      });
    }
  },
};
