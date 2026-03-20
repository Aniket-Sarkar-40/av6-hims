import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";
import { documentService } from "@/services/appointment/document.service.js";
import { DocumentMasterReq } from "@/types/appointment/document.js";

export const createDocument = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createDocument::controller");
  const input = req.body as DocumentMasterReq;
  const document = await documentService.createDocument(input);
  const response = BaseResponse.success(
    { type: "CREATED", data: document },
    "Document",
  );
  logger.info("exiting::createDocument::controller");
  return res.status(201).json(response);
});
