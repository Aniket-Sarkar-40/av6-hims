import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { patientConsultationService } from "@/services/appointment/patientConsultation.service.js";
import { CreatePatientConsultationInput } from "@/types/appointment/patientConsultation.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createPatientConsultation = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createPatientConsultation::controller");
    const input = req.body as CreatePatientConsultationInput;
    const createdPatientConsultation =
      await patientConsultationService.createPatientConsultation(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: createdPatientConsultation },
      "Patient Consultation",
    );
    logger.info("exiting::createPatientConsultation::controller");
    return res.status(201).json(response);
  },
);

export const updatePatientConsultation = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updatePatientConsultation::controller");
    const input = req.body;
    const updated =
      await patientConsultationService.updatePatientConsultation(input);
    const response = BaseResponse.success(
      { type: "UPDATED", data: updated },
      "Patient Consultation",
    );
    logger.info("exiting::updatePatientConsultation::controller");
    return res.status(200).json(response);
  },
);
