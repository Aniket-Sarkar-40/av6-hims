import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { followUpService } from "@/services/appointment/followUp.service.js";
import { CreateFollowUpInput } from "@/types/appointment/followUp.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createFollowUp = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createFollowUp::controller");
  const input = req.body as CreateFollowUpInput;
  const followUp = await followUpService.createFollowUp(input);
  const response = BaseResponse.success(
    { type: "CREATED", data: followUp },
    "Patient Follow Up",
  );
  logger.info("exiting::createFollowUp::controller");
  return res.status(201).json(response);
});
