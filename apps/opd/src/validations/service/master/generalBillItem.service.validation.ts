import {
  getGeneralBillItemByIdFromDb,
  getGeneralBillItemByNameFromDb,
} from "@/repository/master/generalBillItem.repository.js";
import {
  CreateGeneralBillItemMasterInput,
  UpdateGeneralBillItemMasterInput,
} from "@/types/master/generalBillItem.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";

export const validateIdGeneralBillItem = async (id: number) => {
  logger.info("entering::validateIdGeneralBillItem::service::validation");
  validIdCheck(id);
  const response = await getGeneralBillItemByIdFromDb(id);
  if (!response) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "General Bill Item"),
    );
  }
  logger.info("exiting::validateIdGeneralBillItem::service::validation");
  return response;
};

export const createGeneralBillItemServiceValidation = async (
  input: CreateGeneralBillItemMasterInput,
) => {
  logger.info("entering::createGeneralBillItem::service::validation");

  const existing = await getGeneralBillItemByNameFromDb(input.name);
  if (existing) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "General Bill Item"),
    );
  }

  logger.info("exiting::createGeneralBillItem::service::validation");
};
export const updateGeneralBillItemServiceValidation = async (
  input: UpdateGeneralBillItemMasterInput,
) => {
  logger.info("entering::updateGeneralBillItem::service::validation");

  await validateIdGeneralBillItem(input.id);
  const existing = await getGeneralBillItemByNameFromDb(input.name);
  if (existing && existing.id !== input.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "General Bill Item"),
    );
  }

  logger.info("exiting::updateGeneralBillItem::service::validation");
};
