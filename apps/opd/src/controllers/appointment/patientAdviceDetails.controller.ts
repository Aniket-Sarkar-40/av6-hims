import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { patientAdviceDetailsService } from "@/services/appointment/patientAdviceDetails.service.js";
import { CreatePatientAdviceDetailsInput } from "@/types/appointment/patientAdviceDetails.js";

import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createPatientAdviceDetails = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createPatientAdviceDetails::controller");
    const input = req.body as CreatePatientAdviceDetailsInput;
    const createdAdviceDetails =
      await patientAdviceDetailsService.createPatientAdviceDetails(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: createdAdviceDetails },
      "Patient Advice Details",
    );
    logger.info("exiting::createPatientAdviceDetails::controller");
    return res.status(201).json(response);
  },
);

export const getPatientAdviceDetailsByAppointmentId = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getPatientAdviceDetailsByAppointmentId::controller");
    const { appointmentId } = req.query as { appointmentId: string };
    const row =
      await patientAdviceDetailsService.getPatientAdviceDetailsByAppointmentId(
        Number(appointmentId),
      );
    const response = BaseResponse.success(
      { type: "FETCHED", data: row },
      "Patient Advice Details",
    );
    logger.info("exiting::getPatientAdviceDetailsByAppointmentId::controller");
    return res.status(200).json(response);
  },
);
