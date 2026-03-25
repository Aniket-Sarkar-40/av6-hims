import { TryCatch } from "@repo/platform";
import { patientsService } from "@/services/insurance/patients.service.js";
import { PatientImage, PatientReq } from "@/types/insurance/patients.js";
import { promises as fs } from "fs";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";
import path from "path";
import { authService } from "@/services/auth.service.js";
import { FileInfo } from "@repo/shared/types/global.js";

const UPLOADS_BASE = path.resolve(process.cwd(), "uploads");

export const createPatients = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createPatients::controller");
  const input = req.body as PatientReq;
  const files = req.files as PatientImage;

  const fileInfos: FileInfo[] = [];

  for (const field of ["image", "patientImage", "patientSignature"] as const) {
    const file = files[field]?.[0];
    if (file) {
      const absDir = path.dirname(file.path);
      let relDir = path.relative(UPLOADS_BASE, absDir);
      relDir = relDir.split(path.sep).join("/");
      const buffer = await fs.readFile(file.path);
      const base64 = `data:${file.mimetype};base64,${buffer.toString("base64")}`;
      fileInfos.push({ fileName: file.filename, path: relDir, base64 });
    }
  }
  const patients = await patientsService.createPatients(input);
  await authService.uploadInsuranceImagesExt(fileInfos);

  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("CREATED", "Patients"),
    },
    patients,
  );
  logger.info("exiting::createPatients::controller");
  return res.status(201).json(response);
});

export const updatePatients = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updatePatients::controller");

  const input = req.body as PatientReq;

  const id = input.id;
  const files = req.files as PatientImage;

  const fileInfos: FileInfo[] = [];

  for (const field of ["image", "patientImage", "patientSignature"] as const) {
    const file = files[field]?.[0];
    if (file) {
      const absDir = path.dirname(file.path);
      let relDir = path.relative(UPLOADS_BASE, absDir);
      relDir = relDir.split(path.sep).join("/");
      const buffer = await fs.readFile(file.path);
      const base64 = `data:${file.mimetype};base64,${buffer.toString("base64")}`;
      fileInfos.push({ fileName: file.filename, path: relDir, base64 });
    }
  }

  const updated = await patientsService.updatePatients(Number(id), input);
  await authService.uploadInsuranceImagesExt(fileInfos);

  logger.info("exiting::updatePatients::controller");

  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Patients"),
      },
      updated,
    ),
  );
});

export const getAllPatients = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllPatients::controller");
  const patients = await patientsService.getAllPatients();
  logger.info("exiting::getAllPatients::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Patients"),
      },
      patients,
    ),
  );
});
export const getPatientsById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getPatientsById::controller");
  const { patientId } = req.query as { patientId: string };

  const patients = await patientsService.getPatientsById(Number(patientId));

  if (!patients) {
    return res.status(404).json(
      new BaseResponse({
        success: false,
        message: "patients not found",
      }),
    );
  }

  logger.info("exiting::getPatientsById::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Patients"),
      },
      patients,
    ),
  );
});

export const deletePatients = TryCatch(async (req, res) => {
  logger.info("entering::deletePatients::controller");
  const { patientId } = req.query as { patientId: string };

  await patientsService.deletePatients(Number(patientId));

  logger.info("exiting::deletePatients::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("DELETED", "Patients"),
  });
});
