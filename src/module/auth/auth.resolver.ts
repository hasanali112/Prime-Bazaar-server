import { UserRole } from "@prisma/client";
import { TPrisma, TUserType } from "./auth.interface";
import { ManagePassword } from "../../helper/handlePassword";
import AppError from "../../error/AppError";
import { assert } from "console";
import { jwtHelper } from "../../helper/jwtHelper";
import config from "../../config";

interface ProfileModel {
  create: (args: { data: any }) => Promise<any>;
}

export const authResolver = {
  //user SignUp
  userSignUp: async (_parant: any, args: TUserType, { prisma }: TPrisma) => {
    const { email, password, role, ...userInfo } = args.input;

    const hashedPassword = await ManagePassword.hashPassword(password);

    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (existingUser) {
        throw new AppError("User already exists", "BAD_REQUEST");
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
      throw new AppError("SignUp Failed", "BAD_REQUEST");
    }
  },

  //user login

  login: async (parent: any, { email, password }: any, { prisma }: TPrisma) => {
    const isUserExist = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!isUserExist) {
      throw new AppError("User Not Found", "BAD_REQUEST");
    }

    const isPasswordMatch = await ManagePassword.comparedPassword(
      password,
      isUserExist.password
    );

    if (!isPasswordMatch) {
      throw new AppError("Invalid Password", "BAD_REQUEST");
    }

    const jwtPayload = {
      email: email,
      role: isUserExist.role,
    };

    const accessToken = jwtHelper.generateToken(
      jwtPayload,
      config.access_secret as string,
      config.access_expires_in as string
    );

    const refreshToken = jwtHelper.generateToken(
      jwtPayload,
      config.refresh_secret as string,
      config.refresh_expires_in as string
    );

    return {
      accessToken,
    };
  },
};
