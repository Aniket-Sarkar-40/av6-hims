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

/**
 * Translates a Prisma error into a user-safe ErrorHandler with an appropriate
 * HTTP status. We never surface raw Prisma messages (they can leak schema
 * details) - only stable, generic messages.
 */
function mapPrismaError(err: unknown): ErrorHandler | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return new ErrorHandler(409, "A record with these values already exists.");
      case "P2025":
        return new ErrorHandler(404, "The requested record was not found.");
      case "P2003":
        return new ErrorHandler(409, "Operation violates a data relationship.");
      case "P2000":
        return new ErrorHandler(400, "A provided value is too long.");
      case "P2011":
      case "P2012":
        return new ErrorHandler(400, "A required value is missing.");
      default:
        return new ErrorHandler(400, "The request could not be processed.");
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return new ErrorHandler(400, "Invalid data supplied.");
  }

  if (
    err instanceof Prisma.PrismaClientUnknownRequestError ||
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientRustPanicError
  ) {
    return new ErrorHandler(500, "A database error occurred.");
  }

  return null;
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

  // Best-effort cleanup of any files uploaded during the failed request.
  // Wrapped so a cleanup failure can never crash the error response itself.
  try {
    if (req.uploadedFile) {
      const { bucket, key } = req.uploadedFile;
      await deleteFileByEnv(bucket, key);
    }
    if (req.uploadedFiles?.length) {
      for (const file of req.uploadedFiles) {
        await deleteFileByEnv(file.bucket, file.key);
      }
    }
  } catch (cleanupErr) {
    logger.error("Error during uploaded-file cleanup", cleanupErr);
  }

  let handler: ErrorHandler;

  const prismaHandler = mapPrismaError(err);
  if (prismaHandler) {
    handler = prismaHandler;
  } else if (err instanceof ErrorHandler) {
    handler = err;
  } else {
    // Unknown error: never leak the raw message to the client.
    handler = new ErrorHandler(500, "Internal Server Error");
  }

  // Log the FULL error server-side (stack + traceId), regardless of what the
  // client sees.
  logger.error(
    `[${req.traceId ?? "-"}] ${req.method} ${req.originalUrl} -> ${handler.statusCode}`,
    err instanceof Error ? err.stack ?? err.message : err
  );

  const response: ApiResponse = {
    success: false,
    message: handler.name,
    errorMessage: handler.message,
    errorCode:
      statusCodeToErrorCode[handler.statusCode] || "INTERNAL_SERVER_ERROR",
    errors: handler.errors,
  };

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
