import { TryCatch } from "@repo/platform";
import { expenseService } from "@/services/consumerConnect/expense.service.js";

import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import {
  generateErrorMessage,
  generateSuccessMessage,
} from "@repo/shared/utils/responseMessage.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Request, Response } from "express";
import { ExpenseInput } from "@/types/consumerConnect/expense.js";
import path from "path";
import { deleteFileIfExists } from "@repo/platform/middlewares/imageUpload.middleware.js";

export const createExpense = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createExpense::controller");
  const data = req.body as ExpenseInput;
  if (req.file) {
    const absolutePath = req.file.path;
    const relativePath = absolutePath.replace(process.cwd(), "");
    data.documents = relativePath.startsWith(path.sep)
      ? relativePath
      : path.sep + relativePath;
  }
  const expense = await expenseService.createExpense(data);

  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("CREATED", "Expense "),
    },
    expense,
  );
  logger.info("exiting::createExpense::controller");
  return res.status(201).json(response);
});

export const getAllExpense = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllExpense::controller");
  const expenses = await expenseService.getAllExpense();
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("FETCHED", "Expense"),
    },
    expenses,
  );
  logger.info("exiting::getAllExpense::controller");
  return res.status(200).json(response);
});

export const getExpenseById = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getExpenseById::controller");
  const { expenseId } = req.query as { expenseId: string };

  const expense = await expenseService.getExpenseById(Number(expenseId));
  if (!expense) {
    return res.status(404).json(
      new BaseResponse({
        success: false,
        message: generateErrorMessage("NOT_FOUND", "Expense"),
      }),
    );
  }
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("FETCHED", "Expense "),
    },
    expense,
  );
  logger.info("exiting::getExpenseById::controller");
  return res.status(200).json(response);
});

export const updateExpense = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateExpense::controller");

  const data = req.body as ExpenseInput;
  const id = Number(data.id);
  if (!id || isNaN(id) || id <= 0) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }

  const expense = await expenseService.getExpenseById(id);
  let oldImagePath: string | null = null;
  if (req.file) {
    if (expense?.documents) {
      let documentPath = expense.documents;
      if (documentPath.startsWith("http")) {
        try {
          documentPath = new URL(documentPath).pathname;
        } catch (error) {
          logger.error("Error converting document URL to pathname", error);
        }
      }
      oldImagePath = path.join(process.cwd(), documentPath);
    }

    const absolutePath = req.file.path;
    const relativePath = absolutePath.replace(process.cwd(), "");
    data.documents = relativePath.startsWith(path.sep)
      ? relativePath
      : path.sep + relativePath;
  }

  const updatedExpense = await expenseService.updateExpense(data);
  if (oldImagePath) {
    try {
      deleteFileIfExists(oldImagePath);
      logger.info(`Deleted old image file at: ${oldImagePath}`);
    } catch (error) {
      logger.error(
        `Failed to delete old image file at ${oldImagePath}:`,
        error,
      );
    }
  }

  if (!updatedExpense) {
    return res.status(404).json(
      new BaseResponse({
        success: false,
        message: generateErrorMessage("NOT_FOUND", "Expense "),
      }),
    );
  }
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("UPDATED", "Expense "),
    },
    updatedExpense,
  );
  logger.info("exiting::updateExpense::controller");
  return res.status(200).json(response);
});

export const deleteExpense = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteExpense::controller");
  const { expenseId } = req.query as { expenseId: string };
  const result = await expenseService.deleteExpense(Number(expenseId));
  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("DELETED", "Expense"),
    },
    result,
  );
  logger.info("exiting::deleteExpense::controller");
  return res.status(200).json(response);
});

//update and create expense done
