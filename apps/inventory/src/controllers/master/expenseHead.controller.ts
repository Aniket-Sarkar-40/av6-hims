import { TryCatch } from "@repo/platform/middlewares/error.middleware.js";
import { expenseHeadService } from "@/services/master/expenseHead.service.js";
import {
  createExpenseHeadInput,
  updateExpenseHeadInput,
} from "@/types/master/expenseHead.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import {
  generateErrorMessage,
  generateSuccessMessage,
} from "@repo/shared/utils/responseMessage.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";

export const createExpenseHead = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::createExpenseHead::controller");
    const data = req.body as createExpenseHeadInput;
    const expenseHead = await expenseHeadService.createExpenseHead(data);

    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("CREATED", "Expense Head"),
      },
      expenseHead,
    );
    logger.info("exiting::createExpenseHead::controller");
    return res.status(201).json(response);
  },
);

export const getAllExpenseHeads = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getAllExpenseHeads::controller");
    const expenseHeads = await expenseHeadService.getAllExpenseHeads();
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Expense Heads"),
      },
      expenseHeads,
    );
    logger.info("exiting::getAllExpenseHeads::controller");
    return res.status(200).json(response);
  },
);

export const getExpenseHeadById = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::getExpenseHeadById::controller");
    const { expenseHeadId } = req.query as { expenseHeadId: string };

    const expenseHead = await expenseHeadService.getExpenseHeadById(
      Number(expenseHeadId),
    );
    if (!expenseHead) {
      return res.status(404).json(
        new BaseResponse({
          success: false,
          message: generateErrorMessage("NOT_FOUND", "Expense Head"),
        }),
      );
    }
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("FETCHED", "Expense Head"),
      },
      expenseHead,
    );
    logger.info("exiting::getExpenseHeadById::controller");
    return res.status(200).json(response);
  },
);

export const updateExpenseHead = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::updateExpenseHead::controller");

    const data = req.body as updateExpenseHeadInput;
    const updatedExpenseHead = await expenseHeadService.updateExpenseHead(data);
    if (!updatedExpenseHead) {
      return res.status(404).json(
        new BaseResponse({
          success: false,
          message: generateErrorMessage("NOT_FOUND", "Expense Head"),
        }),
      );
    }
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Expense Head"),
      },
      updatedExpenseHead,
    );
    logger.info("exiting::updateExpenseHead::controller");
    return res.status(200).json(response);
  },
);
export const deleteExpenseHead = TryCatch(
  async (req: Request, res: Response) => {
    logger.info("entering::deleteExpenseHead::controller");
    const { expenseHeadId } = req.query as { expenseHeadId: string };
    const deletedExpenseHead = await expenseHeadService.deleteExpenseHead(
      Number(expenseHeadId),
    );
    if (!deletedExpenseHead) {
      return res.status(404).json(
        new BaseResponse({
          success: false,
          message: generateErrorMessage("NOT_FOUND", "Expense Head"),
        }),
      );
    }
    const response = new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("DELETED", "Expense Head"),
      },
      deletedExpenseHead,
    );
    logger.info("exiting::deleteExpenseHead::controller");
    return res.status(200).json(response);
  },
);
