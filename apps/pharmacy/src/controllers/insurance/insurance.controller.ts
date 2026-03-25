import { TryCatch } from "@repo/platform";
import { insuranceService } from "@/services/insurance/insurance.service.js";
import { InsuranceReq } from "@/types/insurance/insurance.js";

import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";

export const createInsurance = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createInsurance::controller");
  const input = req.body as InsuranceReq;
  const insurance = await insuranceService.createInsurance(input);
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("CREATED", "insurance"),
    },
    insurance,
  );
  logger.info("exiting::createInsurance::controller");
  return res.status(201).json(response);
});

export const updateInsurance = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateInsurance::controller");

  const input = req.body as InsuranceReq;

  const id = input.id;

  const updated = await insuranceService.updateInsurance(Number(id), input);

  logger.info("exiting::updateInsurance::controller");

  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "insurance"),
      },
      updated,
    ),
  );
});

export const getAllInsurance = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllInsurance::controller");
  const insurance = await insuranceService.getAllInsurance();
  logger.info("exiting::getAllInsurance::controller");
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "insurance"),
      },
      insurance,
    ),
  );
});
export const getInsuranceById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getInsuranceById::controller");
    const { insuranceId } = req.query as { insuranceId: string };

    const insurance = await insuranceService.getInsuranceById(
      Number(insuranceId),
    );

    if (!insurance) {
      return res.status(404).json(
        new BaseResponse({
          success: false,
          message: "insurance not found",
        }),
      );
    }

    logger.info("exiting::getInsuranceById::controller");
    return res.status(200).json(
      new BaseResponse(
        {
          success: true,
          message: generateSuccessMessage("FETCHED", "insurance"),
        },
        insurance,
      ),
    );
  },
);

export const deleteInsurance = TryCatch(async (req, res) => {
  logger.info("entering::deleteInsurance::controller");
  const { insuranceId } = req.query as { insuranceId: string };

  await insuranceService.deleteInsurance(Number(insuranceId));

  logger.info("exiting::deleteInsurance::controller");
  return res.status(200).json({
    success: true,
    message: generateSuccessMessage("DELETED", "insurance"),
  });
});
