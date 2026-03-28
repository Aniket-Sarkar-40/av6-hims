import { TryCatch } from "@repo/platform";
import { patientsInsuranceService } from "@/services/insurance/patientInsurance.service.js";
import {
  InsuranceCardImages,
  PatientInsuranceReq,
} from "@/types/insurance/patientsInsurance.js";

import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { PatientInsuranceType } from "@repo/db/generated/prisma/client";
import { Request, Response } from "express";
import path from "path";
import { promises as fs } from "fs";
import { FileInfo } from "@repo/shared/types/global.js";

const UPLOADS_BASE = path.resolve(process.cwd(), "uploads");

export const createPatientsInsurance = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createPatientsInsurance::controller");
    const input = req.body as PatientInsuranceReq;

    const files = req.files as InsuranceCardImages;

    const fileInfos: FileInfo[] = [];

    for (const field of ["cardFrontImage", "cardBackImage"] as const) {
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
    const patientsInsurance =
      await patientsInsuranceService.createPatientsInsurance(input, fileInfos);
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Patients Insurance"),
      },
      patientsInsurance,
    );
    logger.info("exiting::createPatientsInsurance::controller");
    return res.status(201).json(response);
  },
);

export const updatePatientsInsurance = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updatePatientsInsurance::controller");

    const input = req.body as PatientInsuranceReq;

    const id = input.id;

    const files = req.files as InsuranceCardImages;

    const fileInfos: FileInfo[] = [];

    for (const field of ["cardFrontImage", "cardBackImage"] as const) {
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

    const updated = await patientsInsuranceService.updatePatientsInsurance(
      Number(id),
      input,
      fileInfos,
    );

    logger.info("exiting::updatePatientsInsurance::controller");

    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("UPDATED", "Patients Insurance"),
        },
        updated,
      ),
    );
  },
);

export const getAllPatientsInsurance = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllPatientsInsurance::controller");
    const { patientId, insuranceType } = req.query as {
      patientId?: string;
      insuranceType?: PatientInsuranceType;
    };
    if (patientId) validIdCheck(Number(patientId));
    const patientsInsurance =
      await patientsInsuranceService.getAllPatientsInsurance({
        patientId: patientId ? Number(patientId) : undefined,
        insuranceType,
      });
    logger.info("exiting::getAllPatientsInsurance::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Patients Insurance"),
        },
        patientsInsurance,
      ),
    );
  },
);
export const getPatientsInsuranceById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getPatientsInsuranceById::controller");
    const { patientsInsuranceId } = req.query as {
      patientsInsuranceId: string;
    };

    const patientsInsurance =
      await patientsInsuranceService.getPatientsInsuranceById(
        Number(patientsInsuranceId),
      );

    if (!patientsInsurance) {
      return res.status(404).json(
        new BaseResponse({
          success: false,
          message: "patientsInsurance not found",
        }),
      );
    }

    logger.info("exiting::getPatientsInsuranceById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Patients Insurance"),
        },
        patientsInsurance,
      ),
    );
  },
);

export const deletePatientsInsurance = TryCatch(async (req, res) => {
  logger.info("entering::deletePatientsInsurance::controller");
  const { patientsInsuranceId } = req.query as { patientsInsuranceId: string };

  await patientsInsuranceService.deletePatientsInsurance(
    Number(patientsInsuranceId),
  );

  logger.info("exiting::deletePatientsInsurance::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("DELETED", "Patients Insurance"),
  });
});
