import { UserRole } from "@prisma/client";
import { GraphQLError } from "graphql";
import { TPrisma, TUserType } from "./auth.interface";
import { ManagePassword } from "../../helper/handlePassword";

interface ProfileModel {
  create: (args: { data: any }) => Promise<any>;
}

export const authResolver = {
  userSignUp: async (_parant: any, args: TUserType, { prisma }: TPrisma) => {
    const { email, password, role, ...userInfo } = args.input;

    const hashedPassword = await ManagePassword.hashPassword(password);

    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (existingUser) {
        throw new GraphQLError("User already exists", {
          extensions: {
            code: "BAD_REQUEST",
          },
        });
      }

      const result = await prisma.$transaction(async (transactionClient) => {
        const createUser = await transactionClient.user.create({
          data: {
            email,
            password: hashedPassword,
            role: role as UserRole,
          },
        });

        const sepicificUser = {
          userId: createUser.id,
          email,
          ...userInfo,
        };

        const spcificRole: Record<UserRole, ProfileModel> = {
          [UserRole.ADMIN]: transactionClient.admin,
          [UserRole.VENDOR]: transactionClient.vendor,
          [UserRole.CUSTOMER]: transactionClient.customer,
        };

        await spcificRole[role].create({
          data: sepicificUser,
        });

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
