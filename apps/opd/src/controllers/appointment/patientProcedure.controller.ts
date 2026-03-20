import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { patientProcedureService } from "@/services/appointment/patientProcedure.service.js";
import {
  PatientProcedureCreateInput,
  PatientProcedureReturnInput,
  PatientProcedureUpdateInput,
} from "@/types/appointment/patientProcedure.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createPatientProcedure = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createPatientProcedure::controller");
    const input = req.body as PatientProcedureCreateInput;
    const patientProcedure =
      await patientProcedureService.createPatientProcedure(input);
    const response = BaseResponse.success(
      { data: patientProcedure, type: "CREATED" },
      "Patient Procedure",
    );
    logger.info("exiting::createPatientProcedure::controller");
    return res.status(201).json(response);
  },
);

export const updatePatientProcedure = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updatePatientProcedure::controller");
    const input = req.body as PatientProcedureUpdateInput;
    const patientProcedure =
      await patientProcedureService.updatePatientProcedure(input);
    const response = BaseResponse.success(
      { data: patientProcedure, type: "UPDATED" },
      "Patient Procedure",
    );
    logger.info("exiting::updatePatientProcedure::controller");
    return res.status(200).json(response);
  },
);

export const returnPatientProcedure = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::returnPatientProcedure::controller");
    const input = req.body as PatientProcedureReturnInput;
    const patientProcedure =
      await patientProcedureService.returnPatientProcedure(input);
    const response = BaseResponse.success(
      { data: patientProcedure, type: "CANCELLED" },
      "Patient Procedure",
    );
    logger.info("exiting::returnPatientProcedure::controller");
    return res.status(200).json(response);
  },
);
