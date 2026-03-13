import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { templateService } from "@/services/event/template.service.js";
import { CreateOrUpdateTemplate } from "@/types/event/template.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createTemplate = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createTemplate::controller");
  const data = req.body as CreateOrUpdateTemplate;
  const template = await templateService.createTemplate(data);
  const response = BaseResponse.success(
    { type: "CREATED", data: template },
    "Template"
  );
  logger.info("exiting::createTemplate::controller");
  return res.status(201).json(response);
});

export const updateTemplate = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateTemplate::controller");
  const data = req.body;
  const updatedTemplate = await templateService.updateTemplate(data);
  logger.info("exiting::updateTemplate::controller");
  const response = BaseResponse.success(
    { type: "UPDATED", data: updatedTemplate },
    "Template"
  );
  return res.status(200).json(response);
});
