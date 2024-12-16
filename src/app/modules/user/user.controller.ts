import { catchAsyc } from "../utils/catchAsync";
import { UserService } from "./user.service";

const createAdminIntoDB = catchAsyc(async (req, res, next) => {
  const result = await UserService.createAdmin(req.body);
  res.status(200).json(result);
});

export const UserController = { createAdminIntoDB };
