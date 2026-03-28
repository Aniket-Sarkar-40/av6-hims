import { TryCatch } from "@repo/platform";
import { Request, Response } from "express";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";

import { DropDownName } from "@/types/master/dropDownName.js";
import { medTypeService } from "@/services/master/medType.service.js";

export const createMedType = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createMedType::controller");
  const input = req.body;
  const medType = await medTypeService.createMedType(input);
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("CREATED", "Medicine Type"),
    },
    medType,
  );
  logger.info("exiting::createMedType::controller");
  return res.status(201).json(response);
});

export const updateMedType = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateMedType::controller");
  const input = req.body as DropDownName;
  const updatedMedType = await medTypeService.updateMedType(input);
  logger.info("exiting::updateMedType::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Medicine Type"),
      },
      updatedMedType,
    ),
  );
});

export const getAllMedType = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllMedType::controller");
  const cities = await medTypeService.getAllMedType();
  logger.info("exiting::getMedType::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Medicine Type"),
      },
      cities,
    ),
  );
});

export const getMedTypeById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getMedTypeById::controller");
  const { medTypeId } = req.query as { medTypeId: string };

  const medCategory = await medTypeService.getMedTypeById(Number(medTypeId));

  if (!medCategory) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
      }),
    );
  }
  logger.info("exiting::getMedTypeById::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Medicine Type"),
      },
      medCategory,
    ),
  );
});
