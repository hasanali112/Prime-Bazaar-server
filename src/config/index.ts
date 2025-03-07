import dotenv from "dotenv";

dotenv.config();

export default {
  dev_env: process.env.NODE_ENV,
  access_secret: process.env.JWT_ACCESS_SECRET,
  access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  refresh_secret: process.env.JWT_REFRESH_SECRET,
  refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
};
