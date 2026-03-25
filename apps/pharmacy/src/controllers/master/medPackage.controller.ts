import { TryCatch } from "@repo/platform";
import { medPackageService } from "@/services/master/medPackage.service.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const medPackageCreate = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::medPackageCreate::controller");
    const name = req.body as DropDownName;
    const createMedPackage = await medPackageService.createMedPackage(name);
    logger.info("exiting::medPackageCreate::controller");
    return res.status(201).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("CREATED", "Medicine Package"),
        },
        createMedPackage,
      ),
    );
  },
);

export const medPackageGet = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::medPackageGet::controller");
  const medPackage = await medPackageService.getAllMedPackage();
  logger.info("exiting::medPackageGet::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Medicine Package"),
      },
      medPackage,
    ),
  );
});

export const getMedPackageById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getMedPackageById::controller");
    const { medPackageId } = req.query as { medPackageId: string };
    const medPackage = await medPackageService.getMedPackageById(
      Number(medPackageId),
    );

    if (!medPackage) {
      return res.status(400).json(
        new BaseResponse({
          success: false,
        }),
      );
    }
    logger.info("exiting::getMedPackageById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Medicine Package"),
        },
        medPackage,
      ),
    );
  },
);

export const updateMedPackage = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateMedPackage::controller");
    const medPackage = req.body as DropDownName;
    const updatedMedPackage =
      await medPackageService.updateMedPackage(medPackage);
    logger.info("exiting::updateMedPackage::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("UPDATED", "Medicine Package"),
        },
        updatedMedPackage,
      ),
    );
  },
);
