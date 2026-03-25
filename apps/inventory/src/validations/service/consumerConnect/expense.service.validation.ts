import {
  getExpenseByIdFromDb,
  getExpenseByInvoiceNoFromDb,
} from "@/repository/consumerConnect/expense.repository.js";

import { ExpenseInput } from "@/types/consumerConnect/expense.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { YesNoFlag } from "@repo/db/generated/prisma/client";
import { validateIdExpenseHead } from "../master/expenseHead.service.validation.js";

export const validateIdExpense = async (id: number) => {
  logger.info("entering::validateIdExpense::service::validation");

  validIdCheck(id);

  const expense = await getExpenseByIdFromDb(id);

  if (!expense || expense.isActive === YesNoFlag.no) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "expense"));
  }

  logger.info("exiting::validateIdExpense::service::validation");
  return expense;
};

export const createExpenseServiceValidation = async (
  input: ExpenseInput,
): Promise<void> => {
  logger.info("entering::createExpenseServiceValidation::service::validation");
  if (input.expenseHeadId) {
    await validateIdExpenseHead(Number(input.expenseHeadId));
  }
  const existing = await getExpenseByInvoiceNoFromDb(
    input.invoiceNo, // Assuming  unique field for expenses
  );

  if (existing) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Expense"),
    );
  }

  logger.info("exiting::createExpenseServiceValidation::service::validation");
  return;
};

export const updateExpenseServiceValidation = async (
  id: number,
  input: ExpenseInput,
): Promise<void> => {
  logger.info("entering::updateExpenseServiceValidation::service::validation");

  await validateIdExpense(id);
  if (input.expenseHeadId) {
    await validateIdExpenseHead(Number(input.expenseHeadId));
  }
  logger.info("exiting::updateExpenseServiceValidation::service::validation");
  return;
};

export const deleteExpenseServiceValidation = async (
  id: number,
): Promise<void> => {
  logger.info("entering::deleteExpenseServiceValidation::service::validation");

  await validateIdExpense(id);

  logger.info("exiting::deleteExpenseServiceValidation::service::validation");
  return;
};
