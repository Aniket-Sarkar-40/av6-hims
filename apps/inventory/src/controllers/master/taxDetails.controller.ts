import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { taxDetailsService } from "@/services/master/taxDetails.service.js";
import { CreateOrUpdateTaxDetails } from "@/types/master/taxDetails.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createTaxDetails = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createTaxDetails::controller");
    const input = req.body as CreateOrUpdateTaxDetails;
    const taxDetails = await taxDetailsService.createTaxDetails(input);
    const response = BaseResponse.success(
      { type: "CREATED", data: taxDetails },
      "Tax Details",
    );
    logger.info("exiting::createTaxDetails::controller");
    return res.status(200).json(response);
  },
);

export const updateTaxDetails = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateTaxDetails::controller");
    const input = req.body as CreateOrUpdateTaxDetails;
    const updatedTaxDetails = await taxDetailsService.updateTaxDetails(input);
    logger.info("exiting::updateTaxDetails::controller");
    return res
      .status(201)
      .json(
        BaseResponse.success(
          { type: "UPDATED", data: updatedTaxDetails },
          "Tax Details",
        ),
      );
  },
);
