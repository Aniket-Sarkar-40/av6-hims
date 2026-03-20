import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { consultationNotesService } from "@/services/master/consultationNotes.service.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createConsultationNotes = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createConsultationNotes::controller");
    const input = req.body;
    const created =
      await consultationNotesService.createConsultationNotes(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: created },
      "Consultation Notes",
    );
    logger.info("exiting::createConsultationNotes::controller");
    return res.status(201).json(response);
  },
);

export const updateConsultationNotes = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateConsultationNotes::controller");
    const input = req.body;
    const updated =
      await consultationNotesService.updateConsultationNotes(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "Consultation Notes",
    );
    logger.info("exiting::updateConsultationNotes::controller");
    return res.status(200).json(response);
  },
);
