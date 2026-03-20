import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { doctorService } from "@/services/doctor/doctor.service.js";
import { CreateDoctorInput, UpdateDoctorInput } from "@/types/doctor/doctor.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createDoctor = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createDoctor::controller");
  const input = req.body as CreateDoctorInput;
  const createdDoctor = await doctorService.createDoctor(input);
  const response = BaseResponse.success(
    { type: "CREATED", data: createdDoctor },
    "Doctor",
  );
  logger.info("exiting::createDoctor::controller");
  return res.status(201).json(response);
});
export const updateDoctor = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateDoctor::controller");
  const input = req.body as UpdateDoctorInput;
  const updatedDoctor = await doctorService.updateDoctor(input);
  const response = BaseResponse.success(
    { type: "UPDATED", data: updatedDoctor },
    "Doctor",
  );
  logger.info("exiting::updateDoctor::controller");
  return res.status(200).json(response);
});
