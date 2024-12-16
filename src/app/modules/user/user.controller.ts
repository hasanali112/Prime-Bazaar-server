import { Request, Response } from "express";
import { UserService } from "./user.service";

const createAdminIntoDB = async (req: Request, res: Response) => {
  try {
    const result = await UserService.createAdmin(req.body);
    res.status(200).json({
      status: 200,
      success: true,
      message: "Admin created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      success: false,
      message: "Failed to create admin",
      error: error,
    });
  }
};

export const UserController = {
  createAdminIntoDB,
};
