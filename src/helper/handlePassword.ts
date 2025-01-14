import bcrypt from "bcryptjs";

const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

const comparedPassword = async (password: string, hashedPassword: string) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

export const ManagePassword = {
  hashPassword,
  comparedPassword,
};
