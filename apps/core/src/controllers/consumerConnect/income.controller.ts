// src/controllers/incomeHead.controller.ts

import { TryCatch } from "@repo/platform";
import { deleteFileIfExists } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { incomeService } from "@/services/consumerConnect/income.service.js";
import { CreateIncomeInput } from "@/types/consumerConnect/income.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateSuccessMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response } from "express";
import path from "path";

export const createIncome = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::createIncome::controller");
  const input = req.body as CreateIncomeInput;
  const newIncome = await incomeService.createIncome(input);

  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("CREATED", "Income"),
    },
    newIncome,
  );

  logger.info("exiting::createIncome::controller");
  return res.status(201).json(response);
});

export const updateIncome = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::updateIncome::controller");
  const body = req.body as CreateIncomeInput;
  const id = body.id;

  const income = await incomeService.getIncomeById(Number(id));
  let oldImagePath: string | null = null;

  if (req.file) {
    if (income?.documents) {
      let documentPath = income.documents;
      if (documentPath.startsWith("http")) {
        try {
          documentPath = new URL(documentPath).pathname;
        } catch (e) {
          logger.error("Error converting document URL to pathname", e);
        }
      }
      oldImagePath = path.join(process.cwd(), documentPath);
    }

    const absolutePath = req.file.path;
    const relativePath = absolutePath.replace(process.cwd(), "");
    body.documents = relativePath.startsWith(path.sep)
      ? relativePath
      : path.sep + relativePath;
  }

  // Update the income record
  const updatedIncome = await incomeService.updateIncome(Number(id), body);

  // Delete the old document if it exists
  if (oldImagePath) {
    try {
      deleteFileIfExists(oldImagePath);
      logger.info(`Deleted old document at ${oldImagePath}`);
    } catch (err) {
      logger.error(`Error deleting old document at ${oldImagePath}:`, err);
    }
  }

  logger.info("exiting::updateIncome::controller");
  // Return success response
  return res.status(200).json(
    new BaseResponse(
      {
        success: true,
        message: generateSuccessMessage("UPDATED", "Income"),
      },
      updatedIncome,
    ),
  );
});
export const getIncomeId = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getIncomeId::controller");
  const { incomeId } = req.query as { incomeId: string };

  const allIncomeById = await incomeService.getIncomeById(Number(incomeId));

  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("FETCHED", "Income"),
    },
    allIncomeById,
  );

  logger.info("exiting::getIncomeId::controller");
  return res.status(200).json(response);
});

export const getAllIncome = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::getAllIncome::controller");

  const allIncome = await incomeService.getAllIncome();

  const response = new BaseResponse(
    {
      success: true,
      message: generateSuccessMessage("FETCHED", "Income "),
    },
    allIncome,
  );

  logger.info("exiting::getAllIncome::controller");
  return res.status(200).json(response);
});

export const deleteIncome = TryCatch(async (req: Request, res: Response) => {
  logger.info("entering::deleteIncome::controller");

  const { incomeId } = req.query as { incomeId: string };

  // Fetch the income record by ID
  const income = await incomeService.getIncomeById(Number(incomeId));

  // If income has associated documents, delete the file
  if (income?.documents) {
    let documentPath = income.documents;
    if (documentPath.startsWith("http")) {
      try {
        documentPath = new URL(documentPath).pathname;
      } catch (e) {
        logger.error("Error converting document URL to pathname", e);
      }
    }
    const oldDocumentPath = path.join(process.cwd(), documentPath);
    try {
      deleteFileIfExists(oldDocumentPath);
      logger.info(`Deleted old document at ${oldDocumentPath}`);
    } catch (err) {
      logger.error(`Error deleting old document at ${oldDocumentPath}:`, err);
    }
  }

  // Call the service to delete the income
  await incomeService.deleteIncome(Number(incomeId));

  logger.info("exiting::deleteIncome::controller");

  return res.status(200).json(
    new BaseResponse({
      success: true,
      message: generateSuccessMessage("DELETED", "Income"),
    }),
  );
});
