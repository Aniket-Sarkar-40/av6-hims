import { TryCatch } from "@repo/platform";
import { Request, Response } from "express";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { medCategoryService } from "@/services/master/medCategory.service.js";
import { DropDownName } from "@/types/master/dropDownName.js";

export const createMedCategory = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createMedCategory::controller");
    const input = req.body;
    const medCategory = await medCategoryService.createMedCategory(input);
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Medicine Category"),
      },
      medCategory,
    );
    logger.info("exiting::createMedCategory::controller");
    return res.status(201).json(response);
  },
);

export const updateMedCategory = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateMedCategory::controller");
    const input = req.body as DropDownName;
    const updatedMedCategory =
      await medCategoryService.updateMedCategory(input);
    logger.info("exiting::updateMedCategory::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("UPDATED", "Medicine Category"),
        },
        updatedMedCategory,
      ),
    );
  },
);

export const getAllMedCategory = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllMedCategory::controller");
    const cities = await medCategoryService.getAllMedCategory();
    logger.info("exiting::getMedCategory::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Medicine Category"),
        },
        cities,
      ),
    );
  },
);

export const getMedCategoryById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getMedCategoryById::controller");
    const { medCategoryId } = req.query as { medCategoryId: string };
    const edCategory = await medCategoryService.getMedCategoryById(
      Number(medCategoryId),
    );

    if (!edCategory) {
      return res.status(400).json(
        new BaseResponse({
          success: false,
        }),
      );
    }
    logger.info("exiting::getMedCategoryById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "Medicine Category"),
        },
        edCategory,
      ),
    );
  },
);
