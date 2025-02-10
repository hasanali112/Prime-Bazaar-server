import { UserRole, UserStatus } from "@prisma/client";
import { TLoginType, TPrisma, TUserType } from "./auth.interface";
import { ManagePassword } from "../../helper/handlePassword";
import AppError from "../../error/AppError";
import { jwtHelper } from "../../helper/jwtHelper";
import config from "../../config";

interface ProfileModel {
  create: (args: { data: any }) => Promise<any>;
}

export const authResolver = {
  //user SignUp
  userSignUp: async (_parant: any, args: TUserType, { prisma }: TPrisma) => {
    // console.log("args: ", args);
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
      console.error("Error during user signup:", error);
      throw new AppError("SignUp Failed", "BAD_REQUEST");
    }
  },

  //user login
  login: async (parent: any, args: TLoginType, { prisma, res }: TPrisma) => {
    const { email, password } = args.input;
    const isUserExist = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!isUserExist) {
      throw new AppError("User Not Found", "BAD_REQUEST");
    }
    if (isUserExist.status === UserStatus.BLOCKED) {
      throw new AppError("User Blocked", "BAD_REQUEST");
    }
    if (isUserExist.status === UserStatus.SUSPENDED) {
      throw new AppError("User SUSPEND", "BAD_REQUEST");
    }
    if (isUserExist.status === UserStatus.DELETED) {
      throw new AppError("User Deleted", "BAD_REQUEST");
    }

    const isPasswordMatch = await ManagePassword.comparedPassword(
      password,
      isUserExist.password
    );

    if (!isPasswordMatch) {
      throw new AppError("Invalid Password", "BAD_REQUEST");
    }

    const jwtPayload = {
      userId: isUserExist.id,
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

    res.setHeader("Set-Cookie", [
      `refreshToken=${refreshToken}; HttpOnly; Secure=${
        config.dev_env === "production"
      }; SameSite=Strict; Path=/; Max-Age=${30 * 24 * 60 * 60}`,
    ]);
    return {
      message: "Login Successfully",
      accessToken,
    };
  },
};
