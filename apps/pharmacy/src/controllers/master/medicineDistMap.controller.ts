import { TryCatch } from "@repo/platform";
import { Request, Response } from "express";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { MedicineDistMapReq } from "@/types/master/medicineDistMap.js";
import { medicineDistMapService } from "@/services/master/medicineDistMap.service.js";

export const createMedicineDistMap = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createMedicineDistMap::controller");
    const input = req.body;
    const medicineDistMap =
      await medicineDistMapService.createMedicineDistMap(input);
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Medicine Distributor Map"),
      },
      medicineDistMap,
    );
    logger.info("exiting::createMedicineDistMap::controller");
    return res.status(201).json(response);
  },
);

export const updateMedicineDistMap = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateMedicineDistMap::controller");
    const input = req.body as MedicineDistMapReq;
    const updateMedicineDistMap =
      await medicineDistMapService.updateMedicineDistMap(input);
    logger.info("exiting::updateMedicineDistMap::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage(
            "UPDATED",
            "Medicine Distributor Map",
          ),
        },
        updateMedicineDistMap,
      ),
    );
  },
);
