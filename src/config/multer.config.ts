import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import multer from "multer";

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

export const uploadSingleImage = upload.fields([
  { name: "image", maxCount: 1 },
]);

// export const uploadMultipleImage = upload.fields([
//   { name: 'postImages', maxCount: 10 },
// ]);
