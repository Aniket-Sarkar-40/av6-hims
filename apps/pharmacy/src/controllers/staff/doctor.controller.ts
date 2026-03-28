import { TryCatch } from "@repo/platform";
import { doctorService } from "@/services/staff/doctor.service.js";
import { CreateOrUpdateDoctor } from "@/types/staff/doctor.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const createDoctor = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createDoctor::controller");
  const body = req.body as CreateOrUpdateDoctor;

  await doctorService.createDoctor(body);

  logger.info("exiting::createDoctor::controller");
  return res.status(201).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("CREATED", "Doctor"),
    }),
  );
});

export const getAllDoctors = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllDoctors::controller");
  const { designationId } = req.query as { designationId: string };

  const doctors = await doctorService.getAllDoctors(Number(designationId));
  logger.info("exiting::getAllDoctors::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Doctor"),
      },
      doctors,
    ),
  );
});

export const getDoctorById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getDoctorById::controller");
  const { doctorId } = req.params;
  const doctor = await doctorService.getDoctorById(Number(doctorId));

  logger.info("exiting::getAllDoctors::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Doctor"),
      },
      doctor,
    ),
  );
});

export const updateDoctor = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateDoctor::controller");
  const body = req.body as CreateOrUpdateDoctor;
  await doctorService.updateDoctor(body);
  logger.info("exiting::updateDoctor::controller");
  return res.status(200).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("UPDATED", "Doctor"),
    }),
  );
});

export const deleteDoctor = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteDoctor::controller");
  const { doctorId } = req.params;
  await doctorService.deleteDoctor(Number(doctorId));
  logger.info("exiting::deleteDoctor::controller");
  return res.status(200).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("DELETED", "Doctor"),
    }),
  );
});
