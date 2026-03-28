import {
  getExpenseHeadByIdFromDb,
  getExpenseHeadByIncomeHeadNameFromDb,
} from "@/repository/master/expenseHead.repository.js";
import {
  createExpenseHeadInput,
  updateExpenseHeadInput,
} from "@/types/master/expenseHead.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdExpenseHead = async (id: number) => {
  logger.info("entering::validateIdExpenseHead::service::validation");

  validIdCheck(id);

  const expenseHead = await getExpenseHeadByIdFromDb(id);

  if (!expenseHead || expenseHead.isActive === "no") {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "expenseHead"),
    );
  }

  logger.info("exiting::validateIdExpenseHead::service::validation");
  return expenseHead;
};

export const createExpenseHeadServiceValidation = async (
  input: createExpenseHeadInput,
): Promise<void> => {
  logger.info(
    "entering::createExpenseHeadServiceValidation::service::validation",
  );

  if (!input.expenseCategory) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_FIELD", "incomeCategory"),
    );
  }

  const existing = await getExpenseHeadByIncomeHeadNameFromDb(
    input.expenseCategory,
  );

  if (existing) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Expense Head"),
    );
  }

  logger.info(
    "exiting::createExpenseHeadServiceValidation::service::validation",
  );
  return;
};

export const updateExpenseHeadServiceValidation = async (
  input: updateExpenseHeadInput,
): Promise<void> => {
  logger.info(
    "entering::updateExpenseHeadServiceValidation::service::validation",
  );
  if (!input.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_FIELD", "incomeCategory"),
    );
  }

  await validateIdExpenseHead(input.id);

  if (!input.expenseCategory) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_FIELD", "incomeCategory"),
    );
  }

  const existing = await getExpenseHeadByIncomeHeadNameFromDb(
    input.expenseCategory,
  );

  if (existing && existing.id !== input.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Expense Head"),
    );
  }

  logger.info(
    "exiting::updateExpenseHeadServiceValidation::service::validation",
  );
  return;
};

export const deleteExpenseHeadServiceValidation = async (
  id: number,
): Promise<void> => {
  logger.info(
    "entering::deleteExpenseHeadServiceValidation::service::validation",
  );

  await validateIdExpenseHead(id);

  logger.info(
    "exiting::deleteExpenseHeadServiceValidation::service::validation",
  );
  return;
};
