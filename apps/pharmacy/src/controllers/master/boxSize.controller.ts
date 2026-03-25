import { TryCatch } from "@repo/platform";
import { boxSizeService } from "@/services/master/boxSize.service.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const boxSizeCreate = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::boxSizeCreate::controller");
  const name = req.body as DropDownName;
  const createBoxSize = await boxSizeService.createBoxSize(name);
  logger.info("exiting::boxSizeCreate::controller");
  return res.status(201).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Box Size"),
      },
      createBoxSize,
    ),
  );
});

export const boxSizeGet = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::boxSizeGet::controller");
  const boxSize = await boxSizeService.getAllBoxSize();
  logger.info("exiting::boxSizeGet::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Box Size"),
      },
      boxSize,
    ),
  );
});

export const getBoxSizeById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getBoxSizeById::controller");
  const { boxSizeId } = req.query as { boxSizeId: string };
  const boxSize = await boxSizeService.getBoxSizeById(Number(boxSizeId));

  if (!boxSize) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
      }),
    );
  }
  logger.info("exiting::getBoxSizeById::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Box Size"),
      },
      boxSize,
    ),
  );
});

export const updateBoxSize = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateBoxSize::controller");
  const boxSize = req.body as DropDownName;
  const updatedBoxSize = await boxSizeService.updateBoxSize(boxSize);
  logger.info("exiting::updateBoxSize::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Box Size"),
      },
      updatedBoxSize,
    ),
  );
});
