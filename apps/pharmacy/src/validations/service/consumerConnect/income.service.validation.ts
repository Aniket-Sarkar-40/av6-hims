import {
  getIncomeById,
  getIncomeByInvoiceNoFromDb,
} from "@/repository/consumerConnect/income.repository.js";
import { CreateIncomeInput } from "@/types/consumerConnect/income.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { validateIdIncomeHead } from "../master/incomeHead.service.validation.js";

export const validateIdIncome = async (id: number) => {
  logger.info("entering::validateIdIncome service::validation");
  validIdCheck(id);
  const income = await getIncomeById(id);
  if (!income) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "income "));
  }
  logger.info("exiting::validateIdIncome::service::validation");

  return income;
};

export const createIncomeServiceValidation = async (
  body: CreateIncomeInput,
) => {
  logger.info(
    "entering::createIncomeServiceValidation::serviceVal::validation",
  );

  if (body.incHeadId) {
    await validateIdIncomeHead(Number(body.incHeadId));
  }

  const existing = await getIncomeByInvoiceNoFromDb(body.invoiceNo);

  if (existing) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Income"),
    );
  }

  logger.info("exiting::createIncomeServiceValidation::service::validation");
};

export const updateIncomerServiceValidation = async (
  id: number,
  body: CreateIncomeInput,
) => {
  logger.info(
    "entering::updateIncomerServiceValidation::serviceVal::validation",
  );

  if (!id) {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_ID", "Income"));
  }

  const income = await validateIdIncome(Number(id));
  if (body.incHeadId) {
    await validateIdIncomeHead(Number(body.incHeadId));
  }

  logger.info("exiting::updateIncomerServiceValidation::service::validation");

  return income;
};
