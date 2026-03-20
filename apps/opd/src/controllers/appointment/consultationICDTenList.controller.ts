import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { consultationICDTenListService } from "@/services/appointment/consultationICDTenList.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createConsultationICDTenList = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createConsultationICDTenList::controller");
    const input = req.body;
    const created =
      await consultationICDTenListService.createConsultationICDTenList(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: created },
      "Consultation ICD Ten List",
    );
    logger.info("exiting::createConsultationICDTenList::controller");
    return res.status(200).json(response);
  },
);

export const updateConsultationICDTenList = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateConsultationICDTenList::controller");
    const input = req.body;
    const updated =
      await consultationICDTenListService.updateConsultationICDTenList(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "Consultation ICD Ten List",
    );
    logger.info("exiting::updateConsultationICDTenList::controller");
    return res.status(200).json(response);
  },
);
