import { TryCatch } from "@repo/platform";
import { medCompositionService } from "@/services/master/medComposition.service.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const compositionNameCreate = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::compositionNameCreate::controller");
    const name = req.body as DropDownName;
    const createMedCom = await medCompositionService.createMedCompo(name);
    logger.info("exiting::compositionNameCreate::controller");
    return res.status(201).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("CREATED", "Medicine Composition"),
        },
        createMedCom,
      ),
    );
  },
);

export const compositionMedGet = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::compositionMedGet::controller");
    const cities = await medCompositionService.getAllMedCompo();
    logger.info("exiting::compositionMedGet::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Medicine Composition"),
        },
        cities,
      ),
    );
  },
);

export const getMedCompoById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getMedCompoById::controller");
  const { medCompoId } = req.query as { medCompoId: string };
  const medCompo = await medCompositionService.getCMedCompoById(
    Number(medCompoId),
  );

  if (!medCompo) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
      }),
    );
  }
  logger.info("exiting::getMedCompoById::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Medicine Composition"),
      },
      medCompo,
    ),
  );
});

export const updateMedCompo = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateMedCompo::controller");
  const medCompo = req.body as DropDownName;
  const updatedMedCompo = await medCompositionService.updateMedCompo(medCompo);
  logger.info("exiting::updateMedCompo::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Medicine Composition"),
      },
      updatedMedCompo,
    ),
  );
});
