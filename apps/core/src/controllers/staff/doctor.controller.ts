import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { doctorService } from "@/services/staff/doctor.service.js";
import { CreateOrUpdateDoctor } from "@/types/staff/doctor.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createDoctor = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createDoctor::controller");
  const body = req.body as CreateOrUpdateDoctor;
  await doctorService.createDoctor(body);

  const response = BaseResponse.success({ type: "CREATED" }, "Doctor");

  logger.info("exiting::createDoctor::controller");
  return res.status(201).json(response);
});

export const getAllDoctors = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllDoctors::controller");
  const { designationId } = req.query as { designationId: string };
  const doctors = await doctorService.getAllDoctors(Number(designationId));

  const response = BaseResponse.success(
    { type: "FETCHED", data: doctors },
    "Doctor",
  );

  logger.info("exiting::getAllDoctors::controller");
  return res.status(200).json(response);
});

export const getDoctorById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getDoctorById::controller");
  const { doctorId } = req.params;
  const doctor = await doctorService.getDoctorById(Number(doctorId));

  const response = BaseResponse.success(
    { type: "FETCHED", data: doctor },
    "Doctor",
  );

  logger.info("exiting::getDoctorById::controller");
  return res.status(200).json(response);
});

export const updateDoctor = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateDoctor::controller");
  const body = req.body as CreateOrUpdateDoctor;
  await doctorService.updateDoctor(body);

  const response = BaseResponse.success({ type: "UPDATED" }, "Doctor");

  logger.info("exiting::updateDoctor::controller");
  return res.status(200).json(response);
});

export const deleteDoctor = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteDoctor::controller");
  const { doctorId } = req.params;
  await doctorService.deleteDoctor(Number(doctorId));

  const response = BaseResponse.success({ type: "DELETED" }, "Doctor");

  logger.info("exiting::deleteDoctor::controller");
  return res.status(200).json(response);
});
