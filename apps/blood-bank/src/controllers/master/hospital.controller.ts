import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";
import { HospitalReq } from "@/types/master/hospital.js";
import { ToggleActive } from "av6-core-v2";
import { hospitalService } from "@/services/master/hospital.service.js";

export const createHospital = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createHospital::controller");
  const input = req.body;
  const hospital = await hospitalService.createHospital(input);
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("CREATED", "Hospital"),
    },
    hospital,
  );
  logger.info("exiting::createHospital::controller");
  return res.status(201).json(response);
});

export const updateHospital = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateHospital::controller");
  const input = req.body as HospitalReq;
  const updatedHospital = await hospitalService.updateHospital(input);
  logger.info("exiting::updateHospital::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Hospital"),
      },
      updatedHospital,
    ),
  );
});

export const getAllHospital = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllHospital::controller");
  const cities = await hospitalService.getAllHospital();
  logger.info("exiting::getHospital::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Hospital"),
      },
      cities,
    ),
  );
});

export const getHospitalById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getHospitalById::controller");
  const { hospitalId } = req.query as { hospitalId: string };

  const medCategory = await hospitalService.getHospitalById(Number(hospitalId));

  if (!medCategory) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
      }),
    );
  }
  logger.info("exiting::getHospitalById::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Hospital"),
      },
      medCategory,
    ),
  );
});

export const toggleActiveHospital = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::toggleActiveHospital::controller");
    const input = req.body as ToggleActive;

    const hospital = await hospitalService.toggleActiveHospital(input);

    logger.info("exiting::toggleActiveHospital::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("UPDATED", "Hospital"),
        },
        hospital,
      ),
    );
  },
);
