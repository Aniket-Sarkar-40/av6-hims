import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  getIncomeHeadByIdFromDb,
  getIncomeHeadByIncomeHeadNameFromDb,
} from "./../../../repository/master/incomeHead.repository.js";
import {
  CreateIncomeHeadInput,
  UpdateIncomeHeadInput,
} from "@/types/master/incomeHead.js";

export const validateIdIncomeHead = async (incomeHeadId: number) => {
  logger.info("entering::validateIdIncomeHead::service::validation");
  validIdCheck(incomeHeadId);

  const incomeHead = await getIncomeHeadByIdFromDb(incomeHeadId);
  if (!incomeHead) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "incomeHead"),
    );
  }
  logger.info("exiting::validateIdIncomeHead::service::validation");
  return incomeHead;
};

export const getIdIncomeHeadServiceValidation = async (
  incomeHeadId: number,
): Promise<void> => {
  logger.info(
    "entering::getIdIncomeHeadServiceValidation::service::validation",
  );

  await validateIdIncomeHead(incomeHeadId);

  logger.info("exiting::getIdIncomeHeadServiceValidation::service::validation");

  return;
};

export const updateIdIncomeHeadServiceValidation = async (
  income: UpdateIncomeHeadInput,
): Promise<void> => {
  logger.info(
    "entering::updateIdIncomeHeadServiceValidation::service::validation",
  );
  await validateIdIncomeHead(income.id);

  if (!income.incomeCategory) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_FIELD", "incomeCategory"),
    );
  }

  const incomeHead = await getIncomeHeadByIncomeHeadNameFromDb(
    income.incomeCategory,
  );
  if (incomeHead && incomeHead.isActive) {
    if (incomeHead.id !== income.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Income Category"),
      );
    }
  }

  logger.info(
    "exiting::updateIdIncomeHeadServiceValidation::service::validation",
  );
  return;
};

export const createIncomeHeadServiceValidation = async (
  income: CreateIncomeHeadInput,
): Promise<void> => {
  logger.info(
    "entering::createIncomeHeadServiceValidation::service::validation",
  );

  const incomeHead = await getIncomeHeadByIncomeHeadNameFromDb(
    income.incomeCategory,
  );
  if (incomeHead) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Income Category"),
    );
  }

  logger.info(
    "exiting::createIncomeHeadServiceValidation::service::validation",
  );
  return;
};
