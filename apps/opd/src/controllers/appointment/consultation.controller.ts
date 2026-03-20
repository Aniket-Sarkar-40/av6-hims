import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { consultationService } from "@/services/appointment/consultaion.service.js";
import { CreateConsultationInput } from "@/types/appointment/consultation.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createConsultation = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createConsultation::controller");
    const input = req.body as CreateConsultationInput;
    const consultation = await consultationService.createConsultation(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: consultation },
      "Patient Consultation Notes",
    );
    logger.info("exiting::createConsultation::controller");
    return res.status(201).json(response);
  },
);
