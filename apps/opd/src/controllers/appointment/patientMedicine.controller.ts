import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { patientMedicineService } from "@/services/appointment/patientMedicine.service.js";
import {
  CreatePatientMedicineInput,
  SearchMedicineInput,
  UpdatePatientMedicineInput,
} from "@/types/appointment/patientMedicine.js";

import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createPatientMedicine = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createPatientMedicine::controller");
    const input = req.body as CreatePatientMedicineInput;
    const patientMedicine =
      await patientMedicineService.createPatientMedicine(input);
    const response = BaseResponse.success(
      { data: patientMedicine, type: "CREATED" },
      "Patient Medicine",
    );
    logger.info("exiting::createPatientMedicine::controller");
    return res.status(201).json(response);
  },
);

export const updatePatientMedicine = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updatePatientMedicine::controller");

    const input = req.body as UpdatePatientMedicineInput;

    await patientMedicineService.updatePatientMedicine(input);

    logger.info("exiting::updatePatientMedicine::controller");
    return res
      .status(200)
      .json(BaseResponse.success({ type: "UPDATED" }, "Patient Medicine"));
  },
);

export const getPatientMedicineById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getPatientMedicineById::controller");
    const { patientMedicineId } = req.query as { patientMedicineId: string };

    const patientMedicine = await patientMedicineService.getPatientMedicineById(
      Number(patientMedicineId),
    );

    logger.info("exiting::getPatientMedicineById::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { data: patientMedicine, type: "FETCHED" },
          "Patient Medicine",
        ),
      );
  },
);

export const getMedicines = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getPatientMedicineById::controller");
  const input = req.body as SearchMedicineInput;

  const patientMedicine = await patientMedicineService.getMedicines(input);

  logger.info("exiting::getPatientMedicineById::controller");
  return res
    .status(200)
    .json(
      BaseResponse.success(
        { data: patientMedicine, type: "FETCHED" },
        "Patient Medicine",
      ),
    );
});

export const deletePatientMedicine = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deletePatientMedicine::controller");
    const { id } = req.query as { id: string };

    await patientMedicineService.deletePatientMedicine(Number(id));

    logger.info("exiting::deletePatientMedicine::controller");
    return res
      .status(200)
      .json(BaseResponse.success({ type: "DELETED" }, "Patient Medicine"));
  },
);
