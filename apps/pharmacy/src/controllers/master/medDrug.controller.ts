import { TryCatch } from "@repo/platform";
import { medDrugService } from "@/services/master/medDrug.service.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const medDrugCreate = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::medDrugCreate::controller");
  const name = req.body as DropDownName;
  const createMedDrug = await medDrugService.createMedDrug(name);
  logger.info("exiting::medDrugCreate::controller");
  return res.status(201).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Medicine Drug"),
      },
      createMedDrug,
    ),
  );
});

export const medDrugGet = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::medDrugGet::controller");
  const medDrug = await medDrugService.getAllMedDrug();
  logger.info("exiting::medDrugGet::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Medicine Drug"),
      },
      medDrug,
    ),
  );
});

export const getMedDrugById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getMedDrugById::controller");
  const { medDrugId } = req.query as { medDrugId: string };
  const medDrug = await medDrugService.getMedDrugById(Number(medDrugId));

  if (!medDrug) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
      }),
    );
  }
  logger.info("exiting::getMedDrugById::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Medicine Drug"),
      },
      medDrug,
    ),
  );
});

export const updateMedDrug = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateMedDrug::controller");
  const medDrug = req.body as DropDownName;
  const updatedMedDrug = await medDrugService.updateMedDrug(medDrug);
  logger.info("exiting::updateMedDrug::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Medicine Drug"),
      },
      updatedMedDrug,
    ),
  );
});
