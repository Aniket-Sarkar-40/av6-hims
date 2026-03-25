import { TryCatch } from "@repo/platform";
import { medDosageService } from "@/services/master/medDosage.service.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const dosageCreate = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::dosageCreate::controller");
  const name = req.body as DropDownName;
  const createMedDosage = await medDosageService.createMedDosage(name);
  logger.info("exiting::dosageCreate::controller");
  return res.status(201).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Medicine Dosage"),
      },
      createMedDosage,
    ),
  );
});

export const medDosageGet = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::medDosageGet::controller");
  const medDosage = await medDosageService.getAllMedDosage();
  logger.info("exiting::medDosageGet::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Medicine Dosage"),
      },
      medDosage,
    ),
  );
});

export const getMedDosageById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getMedDosageById::controller");
    const { medDosageId } = req.query as { medDosageId: string };
    const medDosage = await medDosageService.getMedDosageById(
      Number(medDosageId),
    );

    if (!medDosage) {
      return res.status(400).json(
        new BaseResponse({
          success: false,
        }),
      );
    }
    logger.info("exiting::getMedDosageById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Medicine Dosage"),
        },
        medDosage,
      ),
    );
  },
);

export const updateMedDosage = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateMedDosage::controller");
  const medDosage = req.body as DropDownName;
  const updatedMedDosage = await medDosageService.updateMedDosage(medDosage);
  logger.info("exiting::updateMedDosage::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Medicine Dosage"),
      },
      updatedMedDosage,
    ),
  );
});
