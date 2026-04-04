import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { Request, Response } from "express";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import {
  CreateIncomeHeadInput,
  UpdateIncomeHeadInput,
} from "@/types/master/incomeHead.js";
import { incomeHeadService } from "@/services/master/incomeHead.service.js";

export const createIncomeHead = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createIncomeHead::controller");
    const input = req.body as CreateIncomeHeadInput;

    const newIncomeHead = await incomeHeadService.createIncomeHead(input);

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Income Head"),
      },
      newIncomeHead
    );

    logger.info("exiting::createIncomeHead::controller");
    return res.status(201).json(response);
  }
);

export const updateIncomeHead = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateIncomeHead::controller");
    const input = req.body as UpdateIncomeHeadInput;

    const updatedIncomeHead = await incomeHeadService.updateIncomeHead(input);

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Income Head"),
      },
      updatedIncomeHead
    );

    logger.info("exiting::updateIncomeHead::controller");
    return res.status(200).json(response);
  }
);

export const getIncomeHeadId = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getIncomeHeadId::controller");
  const { incomeHeadId } = req.query as { incomeHeadId: string };

  const allIncomeHeadsById = await incomeHeadService.getIncomeHeadById(
    Number(incomeHeadId)
  );

  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("FETCHED", "Income Head"),
    },
    allIncomeHeadsById
  );

  logger.info("exiting::getIncomeHeadId::controller");
  return res.status(200).json(response);
});

export const getAllIncomeHead = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllIncomeHead::controller");

    const allIncomeHeads = await incomeHeadService.getAllIncomeHead();

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Income Head"),
      },
      allIncomeHeads
    );

    logger.info("exiting::getAllIncomeHead::controller");
    return res.status(200).json(response);
  }
);

export const deleteIncomeHead = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteIncomeHead::controller");

    const { incomeHeadId } = req.query as { incomeHeadId: string };
    await incomeHeadService.deleteIncomeHead(Number(incomeHeadId));
    logger.info("exiting::deleteIncomeHead::controller");

    return res.status(200).json(
      new BaseResponse({
        success: true,
        message: generateSuccessMessage("DELETED", "Income Head"),
      })
    );
  }
);
