import { TryCatch } from "@/middlewares/error.middleware";
import { taxDetailsService } from "@/services/master/taxDetails.service";
import { CreateOrUpdateTaxDetails } from "@/types/master/taxDetails";
import { BaseResponse } from "@/utils/baseResponse.utils";
import { logger } from "@/utils/logger.utils";
import { Request, Response } from "express";

export const createTaxDetails = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createTaxDetails::controller");
  const input = req.body as CreateOrUpdateTaxDetails;
  const taxDetails = await taxDetailsService.createTaxDetails(input);
  const response = BaseResponse.success({ type: "CREATED", data: taxDetails }, "Tax Details");
  logger.info("exiting::createTaxDetails::controller");
  return res.status(200).json(response);
});

export const updateTaxDetails = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateTaxDetails::controller");
  const input = req.body as CreateOrUpdateTaxDetails;
  const updatedTaxDetails = await taxDetailsService.updateTaxDetails(input);
  logger.info("exiting::updateTaxDetails::controller");
  return res.status(201).json(BaseResponse.success({ type: "UPDATED", data: updatedTaxDetails }, "Tax Details"));
});
