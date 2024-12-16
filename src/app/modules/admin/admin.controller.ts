import { Request, Response } from "express";
import { AdminService } from "./admin.service";

const getAllAdmin = async (req: Request, res: Response) => {
  try {
    const result = await AdminService.getAdminFromDB(req.query);
    res.status(200).json({
      status: 200,
      success: true,
      message: "Admin fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      success: false,
      message: "Failed to fetch admin",
      error: error,
    });
  }
};

export const AdminController = {
  getAllAdmin,
};
