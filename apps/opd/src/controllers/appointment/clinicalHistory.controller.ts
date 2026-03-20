import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { clinicalHistoryService } from "@/services/appointment/clinicalHistory.service.js";
import {
  CreateClinicalHistoryInput,
  UpdateClinicalHistoryInput,
} from "@/types/appointment/clinicalHistory.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createClinicalHistory = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createClinicalHistory::controller");
    const input = req.body as CreateClinicalHistoryInput;
    const clinicalHistory =
      await clinicalHistoryService.createClinicalHistory(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: clinicalHistory },
      "Clinical History",
    );
    logger.info("exiting::createClinicalHistory::controller");
    return res.status(201).json(response);
  },
);

export const updateClinicalHistory = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateClinicalHistory::controller");
    const input = req.body as UpdateClinicalHistoryInput;
    const clinicalHistory =
      await clinicalHistoryService.updateClinicalHistory(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: clinicalHistory },
      "Clinical History",
    );
    logger.info("exiting::updateClinicalHistory::controller");
    return res.status(200).json(response);
  },
);
