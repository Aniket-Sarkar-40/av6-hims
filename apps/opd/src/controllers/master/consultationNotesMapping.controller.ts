import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { consultationNotesMappingService } from "@/services/master/consultationNotesMapping.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createConsultationNotesMapping = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createConsultationNotesMapping::controller");
    const input = req.body;
    const created =
      await consultationNotesMappingService.createConsultationNotesMapping(
        input,
      );
    const response = BaseResponse.success(
      { type: "CREATED", data: created },
      "Consultation Notes Mappings",
    );
    logger.info("exiting::createConsultationNotesMapping::controller");
    return res.status(200).json(response);
  },
);

export const updateConsultationNotesMapping = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateConsultationNotesMapping::controller");
    const input = req.body;
    const updated =
      await consultationNotesMappingService.updateConsultationNotesMapping(
        input,
      );
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "Consultation Notes Mappings",
    );
    logger.info("exiting::updateConsultationNotesMapping::controller");
    return res.status(200).json(response);
  },
);
