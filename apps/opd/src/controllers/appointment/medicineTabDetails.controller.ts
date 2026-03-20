import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { medicineTabDetailsService } from "@/services/appointment/medicineTabDetails.service.js";
import {
  CreateMedicineTabDetails,
  UpdateMedicineTabDetailsInput,
} from "@/types/appointment/medicineTabDetails.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createMedicineTabDetails = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createMedicineTabDetails::controller");

    const input = req.body as CreateMedicineTabDetails;
    const created =
      await medicineTabDetailsService.createMedicineTabDetails(input);

    logger.info("exiting::createMedicineTabDetails::controller");
    return res
      .status(201)
      .json(
        BaseResponse.success(
          { data: created, type: "CREATED" },
          "Medicine Tab Details",
        ),
      );
  },
);

export const updateMedicineTabDetails = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateMedicineTabDetails::controller");

    const input = req.body as UpdateMedicineTabDetailsInput;
    const updated =
      await medicineTabDetailsService.updateMedicineTabDetails(input);

    logger.info("exiting::updateMedicineTabDetails::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { data: updated, type: "UPDATED" },
          "Medicine Tab Details",
        ),
      );
  },
);

export const getMedicineTabDetailsById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getMedicineTabDetailsById::controller");

    const { tabId, ccId } = req.query as { tabId: string; ccId: string };
    const medicineTabDetails =
      await medicineTabDetailsService.getMedicineTabDetailsById(
        Number(tabId),
        Number(ccId),
      );

    logger.info("exiting::getMedicineTabDetailsById::controller");
    return res
      .status(200)
      .json(
        BaseResponse.success(
          { data: medicineTabDetails, type: "FETCHED" },
          "Medicine Tab Details",
        ),
      );
  },
);
