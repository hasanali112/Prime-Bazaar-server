/* eslint-disable @typescript-eslint/no-explicit-any */
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";

const removeExtension = (fileName: string) => {
  return fileName.split(".").slice(0, -1).join(".");
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: {
    public_id: (_req, file) =>
      Math.random().toString(36).substring(2) +
      "-" +
      Date.now() +
      "-" +
      file.fieldname +
      "-" +
      removeExtension(file.originalname),
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// export const uploadSingleImage = upload.fields([
//   { name: "image", maxCount: 1 },
// ]);

// export const uploadMultipleImage = upload.fields([
//   { name: "images", maxCount: 10 },
// ]);
// Support both single and multiple image uploads
export const uploadImages = upload.fields([
  { name: "image", maxCount: 1 }, // For single image upload
  // { name: "images", maxCount: 10 }, // For multiple image upload
]);

// // Configure Cloudinary storage
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinaryUpload,
//   params: {
//     folder: "categories",
//     allowed_formats: ["jpg", "jpeg", "png", "gif"],
//     transformation: [{ width: 500, height: 500, crop: "limit" }],
//   } as any,
// });

// // Configure multer
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 1024 * 1024 * 5, // 5MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedMimes = ["image/jpeg", "image/png", "image/gif"];
//     if (allowedMimes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Invalid file type. Only JPEG, PNG and GIF is allowed."));
//     }
//   },
// });

// // Utility function to delete image from Cloudinary
// const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
//   try {
//     const result = await cloudinary.uploader.destroy(publicId);
//     return result.result === "ok";
//   } catch (error) {
//     console.error("Error deleting from Cloudinary:", error);
//     return false;
//   }
// };

// // Get public ID from Cloudinary URL
// const getPublicIdFromUrl = (url: string): string => {
//   const splitUrl = url.split("/");
//   const filename = splitUrl[splitUrl.length - 1];
//   return `categories/${filename.split(".")[0]}`;
// };

// export { upload, deleteFromCloudinary, getPublicIdFromUrl };
