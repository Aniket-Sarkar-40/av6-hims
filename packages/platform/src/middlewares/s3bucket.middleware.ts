import { deleteFileByEnv } from "@/middlewares/error.middleware.js";
import { logger } from "@/logging/logger.js";
import { HETZNER_BUCKET } from "@repo/shared";
import { uploadFileByEnv } from "@repo/shared/config/storage.strategy.js";
import { AuthRequest } from "@repo/shared/types/request.type.js";
import { optimizeImageSmart } from "@repo/shared/utils/compression.utils.js";
import { NextFunction, Response } from "express";

export const uploadToHetzner =
  (folder: string) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        logger.info("No file uploaded");
        return next();
      }

      let fileToUpload = req.file;

      // 🔥 Apply smart optimization for images
      if (req.file.mimetype.startsWith("image/")) {
        const optimizedBuffer = await optimizeImageSmart(
          req.file.buffer,
          req.file.mimetype
        );

        fileToUpload = {
          ...req.file,
          buffer: optimizedBuffer,
        };
      }

      const result = await uploadFileByEnv(folder, fileToUpload);

      req.fileUrl = result.url;

      // Only exists in production (S3)
      if (result.key) {
        req.uploadedFile = {
          key: result.key,
          bucket: HETZNER_BUCKET!,
        };
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export const uploadMultiToHetzner =
  (folder: string) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return next();
    }

    const uploadedFiles: { key: string; bucket: string }[] = [];
    const fileUrls: Record<string, string[]> = {};

    try {
      for (const file of files) {
        let fileToUpload = file;

        // 🔥 Smart image optimization
        if (file.mimetype.startsWith("image/")) {
          const optimizedBuffer = await optimizeImageSmart(
            file.buffer,
            file.mimetype
          );

          fileToUpload = {
            ...file,
            buffer: optimizedBuffer,
          };
        }

        const result = await uploadFileByEnv(folder, fileToUpload);

        // Track only if S3
        if (result.key) {
          uploadedFiles.push({
            key: result.key,
            bucket: HETZNER_BUCKET!,
          });
        }
        if (file.fieldname) {
          if (!fileUrls[file.fieldname]) {
            fileUrls[file.fieldname] = [];
          }
          fileUrls[file.fieldname]?.push(result.url);
        }
      }
    } catch (err) {
      // 🔥 Rollback only if production (keys exist)
      for (const file of uploadedFiles) {
        await deleteFileByEnv(file.bucket, file.key);
      }

      return next(err);
    }

    const finalMapping: Record<string, string> = {};
    for (const field in fileUrls) {
      finalMapping[field] = fileUrls[field]?.join(",") ?? "";
    }

    req.uploadedFiles = uploadedFiles;
    req.fileUrls = finalMapping;

    next();
  };
