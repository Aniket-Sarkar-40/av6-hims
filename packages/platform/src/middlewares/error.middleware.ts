import { hetznerS3 } from "@repo/shared/config/hetznerS3.config.js";
import { envMode } from "@repo/shared/config/index.js";
import { ApiResponse } from "@repo/shared/types/global.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextFunction, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { statusCodeToErrorCode } from "@repo/shared/utils/statusCodeToErrorCode.utils.js";
import { logger } from "@/logging/logger.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Prisma } from "@repo/db/generated/prisma/client";
import { AuthRequest } from "@repo/shared/types/request.type.js";

export async function deleteFileByEnv(
  bucket: string | undefined,
  keyOrPath: string
) {
  try {
    if (envMode.toUpperCase() === "DEVELOPMENT") {
      const absolutePath = path.isAbsolute(keyOrPath)
        ? keyOrPath
        : path.join(process.cwd(), keyOrPath);

      if (fs.existsSync(absolutePath)) {
        await fs.promises.unlink(absolutePath);
        logger.info(`Deleted local file: ${absolutePath}`);
      }

      return;
    }

    if (bucket) {
      await hetznerS3.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: keyOrPath,
        })
      );

      logger.info(`Deleted S3 file: ${keyOrPath}`);
    }
  } catch (err) {
    logger.error("Failed to delete file", err);
  }
}

export const errorMiddleware = async (
  err: Error,
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  if (req.uploadedFile) {
    const { bucket, key } = req.uploadedFile;
    await deleteFileByEnv(bucket, key);
  }
  if (req.uploadedFiles?.length) {
    for (const file of req.uploadedFiles) {
      await hetznerS3.send(
        new DeleteObjectCommand({
          Bucket: file.bucket,
          Key: file.key,
        })
      );
    }
  }

  let handler: ErrorHandler;

  if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientUnknownRequestError ||
    err instanceof Prisma.PrismaClientValidationError
  ) {
    handler = new ErrorHandler(500, "Something went wrong");
  } else if (err instanceof ErrorHandler) {
    handler = err;
  } else {
    handler = new ErrorHandler(500, err.message || "Internal Server Error");
  }

  const response: ApiResponse = {
    success: false,
    message: handler.name,
    errorMessage: handler.message,
    errorCode:
      statusCodeToErrorCode[handler.statusCode] || "INTERNAL_SERVER_ERROR",
    errors: handler.errors,
  };

  logger.error(handler.message);

  if (envMode.toUpperCase() === "TEST") {
    response.err = handler;
  }

  return res.status(handler.statusCode).json(new BaseResponse(response));
};
type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<unknown, Record<string, unknown>>>;

export const TryCatch =
  (passedFunc: ControllerType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await passedFunc(req, res, next);
    } catch (error) {
      next(error);
    }
  };
