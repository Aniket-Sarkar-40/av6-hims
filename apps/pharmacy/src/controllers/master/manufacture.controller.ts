import { TryCatch } from "@repo/platform";
import { manufactureService } from "@/services/master/manufacture.service.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const manufactureCreate = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::ManufactureCreate::controller");
    const name = req.body as DropDownName;
    const createManufacture = await manufactureService.createManufacture(name);
    logger.info("exiting::ManufactureCreate::controller");
    return res.status(201).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("CREATED", " Manufacture"),
        },
        createManufacture,
      ),
    );
  },
);

export const manufactureGet = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::manufactureGet::controller");
  const manufacture = await manufactureService.getAllManufacture();
  logger.info("exiting::manufactureGet::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", " Manufacture"),
      },
      manufacture,
    ),
  );
});

export const getManufactureById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getManufactureById::controller");
    const { manufactureId } = req.query as { manufactureId: string };
    const manufacture = await manufactureService.getManufactureById(
      Number(manufactureId),
    );

    if (!manufacture) {
      return res.status(400).json(
        new BaseResponse({
          success: false,
        }),
      );
    }
    logger.info("exiting::getManufactureById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", " Manufacture"),
        },
        manufacture,
      ),
    );
  },
);

export const updateManufacture = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateManufacture::controller");
    const manufacture = req.body as DropDownName;
    const updatedManufacture =
      await manufactureService.updateManufacture(manufacture);
    logger.info("exiting::updateManufacture::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("UPDATED", " Manufacture"),
        },
        updatedManufacture,
      ),
    );
  },
);
