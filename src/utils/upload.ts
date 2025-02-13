/* eslint-disable @typescript-eslint/no-explicit-any */
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { cloudinaryUpload } from "../config/cloudinary.config";

// export const uploadToCloudinary = async (file: any, folder: string) => {
//   const { createReadStream } = await file;

//   return new Promise<UploadApiResponse>((resolve, reject) => {
//     const stream = cloudinaryUpload.uploader.upload_stream(
//       { folder },
//       (
//         error: UploadApiErrorResponse | undefined,
//         result: UploadApiResponse | undefined
//       ) => {
//         if (error) {
//           return reject(error);
//         }
//         if (!result) {
//           return reject(
//             new Error("Upload failed, no response from Cloudinary")
//           );
//         }
//         resolve(result);
//       }
//     );

//     createReadStream().pipe(stream);
//   });
// };

// Utility for single image upload
export const uploadSingleImageToCloudinary = async (
  file: any,
  folder: string
): Promise<UploadApiResponse> => {
  try {
    const { createReadStream } = await file;

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinaryUpload.uploader.upload_stream(
        {
          folder,
          resource_type: "auto", // Automatically detect resource type
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (error) {
            return reject(error);
          }
          if (!result) {
            return reject(
              new Error("Upload failed, no response from Cloudinary")
            );
          }
          resolve(result);
        }
      );

      createReadStream().pipe(stream);
    });
  } catch (error) {
    throw new Error(`Failed to upload image: ${error}`);
  }
};

// Utility for multiple image upload
export const uploadMultipleImagesToCloudinary = async (
  files: any[],
  folder: string
): Promise<UploadApiResponse[]> => {
  try {
    // Create an array of promises for parallel upload
    const uploadPromises = files.map((file) =>
      uploadSingleImageToCloudinary(file, folder)
    );

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error(`Failed to upload multiple images: ${error}`);
  }
};
