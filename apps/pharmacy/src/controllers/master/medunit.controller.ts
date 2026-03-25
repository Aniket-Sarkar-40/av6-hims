import { TryCatch } from "@repo/platform";
import { medUnitService } from "@/services/master/medUnit.service.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const unitCreate = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::unitCreate::controller");
  const name = req.body as DropDownName;
  const createMedUnit = await medUnitService.createMedUnit(name);
  logger.info("exiting::unitCreate::controller");
  return res.status(201).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Medicine Unit"),
      },
      createMedUnit,
    ),
  );
});

export const medUnitGet = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::medUnitGet::controller");
  const medUnit = await medUnitService.getAllMedUnit();
  logger.info("exiting::medUnitGet::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Medicine Unit"),
      },
      medUnit,
    ),
  );
});

export const getMedUnitById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getMedUnitById::controller");
  const { medUnitId } = req.query as { medUnitId: string };
  const medUnit = await medUnitService.getMedUnitById(Number(medUnitId));

  if (!medUnit) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
      }),
    );
  }
  logger.info("exiting::getMedUnitById::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Medicine Unit"),
      },
      medUnit,
    ),
  );
});

export const updateMedUnit = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateMedUnit::controller");
  const medUnit = req.body as DropDownName;
  const updatedMedUnit = await medUnitService.updateMedUnit(medUnit);
  logger.info("exiting::updateMedUnit::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Medicine Unit"),
      },
      updatedMedUnit,
    ),
  );
});
