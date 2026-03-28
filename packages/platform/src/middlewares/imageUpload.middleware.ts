import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextFunction, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import {
  uploadMultiToHetzner,
  uploadToHetzner,
} from "./s3bucket.middleware.js";
import { AuthRequest } from "@repo/shared/types/request.type.js";
import { getFileAttrFromShortCode } from "@repo/shared/utils/shortCode/index.js";
import { Service } from "@repo/shared/types/global.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { hetznerS3 } from "@repo/shared/config/hetznerS3.config.js";
import { HETZNER_BUCKET, HETZNER_ENDPOINT } from "@repo/shared";
import { logger } from "@/logging/logger.js";
import fs from "fs";
export const MAX_COUNT = 10;

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "audio/mp3",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
  "audio/m4a",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/mpeg",
];

export type AnyHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => any;
export type AnyHandlerArray = AnyHandler[];

export const createUploadMiddleware = (fieldName: string): AnyHandler => {
  const storage = multer.memoryStorage();

  const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (ALLOWED.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
  }).single(fieldName);
};

export const createUploadMiddlewareForCommon = (
  folder: string,
  service: Service,
) => {
  const storage = multer.memoryStorage();

  const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (ALLOWED.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
  });

  return [
    // Step 1: Parse files into memory
    upload.any(),

    // Step 2: Extract correct file & assign to req.file
    (req: AuthRequest, res: Response, next: NextFunction) => {
      const fieldName = getFileAttrFromShortCode(
        service,
        req.query.shortCode as string,
      );

      const files = (req.files as Express.Multer.File[]) || [];
      if (files.length) {
        const matched = files.find((f) => f.fieldname === fieldName);

        if (!matched) {
          return next(
            new Error(
              `Missing file field "${fieldName}" for shortCode "${req.query.shortCode}"`,
            ),
          );
        }

        req.file = matched;
        req.files = undefined;
      }

      next();
    },

    // Step 3: Upload to Hetzner using your existing middleware
    uploadToHetzner(folder),
  ];
};

export const createUploadMultiMiddleware = (
  folder: string,
  fieldName: string,
): AnyHandlerArray => {
  const storage = multer.memoryStorage();

  const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (ALLOWED.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ErrorHandler(400, "Only image, PDF, or Excel files are allowed!"));
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
  }).array(fieldName, MAX_COUNT);

  return [
    upload,
    uploadMultiToHetzner(folder), // 👇 defined below
  ];
};

function makeFileFilter(
  req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) {
  if (!ALLOWED.includes(file.mimetype)) {
    return cb(
      new ErrorHandler(400, "Only image, PDF, or Excel files are allowed!"),
    );
  }
  cb(null, true);
}

export function createUploadFieldsMiddleware(
  folder: string,
  fields: string[],
): AnyHandlerArray {
  const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: makeFileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
  });

  const spec = fields.map((name) => ({ name, maxCount: 1 }));

  return [
    upload.fields(spec),

    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };

        if (!files) return next();

        const fileUrls: Record<string, string> = {};

        req.uploadedFiles = [];

        for (const fieldName of Object.keys(files)) {
          const file = files[fieldName]?.[0];
          if (!file) continue;
          const ext = path.extname(file.originalname);

          const key = `AV6/${folder}/${Date.now()}-${crypto.randomUUID()}${ext}`;

          await hetznerS3.send(
            new PutObjectCommand({
              Bucket: HETZNER_BUCKET!,
              Key: key,
              Body: file.buffer,
              ContentType: file.mimetype,
            }),
          );

          req.uploadedFiles.push({
            key,
            bucket: HETZNER_BUCKET!,
          });

          fileUrls[fieldName] = `${HETZNER_ENDPOINT}/${HETZNER_BUCKET}/${key}`;
        }

        req.fileUrls = fileUrls; // 👈 preserve field mapping

        next();
      } catch (error) {
        next(error);
      }
    },
  ];
}

export const deleteFileIfExists = (filePath: string): void => {
  logger.info(`Deleting file: ${filePath}`);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted file: ${filePath}`);
    }
  } catch (error) {
    logger.error(`Error deleting file ${filePath}:`, error);
  }
};
