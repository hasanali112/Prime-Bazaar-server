import dotenv from "dotenv";

dotenv.config();

export default {
  dev_env: process.env.DEV_ENV,
  access_secret: process.env.ACCESS_TOKEN_SECRET,
  access_expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN,
  refresh_secret: process.env.REFRESH_TOKEN_SECRET,
  refresh_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
};
