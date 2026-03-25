import {
  getCurrencyByCurrencyCodeNameFromDb,
  getCurrencyByCurrencyNameFromDb,
  getCurrencyByIdFromDb,
} from "@/repository/master/currency.repository.js";
import { CurrencyReq } from "@/types/master/currency.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

import { Currency } from "@repo/db/generated/prisma/client";

export const validIdCurrency = async (currencyId: number) => {
  logger.info("entering::validIdCurrency::service::validation");

  validIdCheck(currencyId);

  const currency = await getCurrencyByIdFromDb(currencyId);
  if (!currency || currency.isActive === false) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "currency"));
  }
  logger.info("exiting::validIdCurrency::service::validation");

  return currency;
};

export const deleteCurrencyServiceValidation = async (
  currencyId: number,
): Promise<void> => {
  logger.info("entering::deleteCurrencyServiceValidation::service::validation");
  await validIdCurrency(currencyId);

  logger.info("exiting::deleteCurrencyServiceValidation::service::validation");

  return;
};

export const getIdCurrencyServiceValidation = async (
  currencyId: number,
): Promise<void> => {
  logger.info("entering::getIdCurrencyServiceValidation::service::validation");
  await validIdCurrency(currencyId);

  logger.info("exiting::getIdCurrencyServiceValidation::service::validation");
  return;
};

export const updateIdCurrencyServiceValidation = async (
  currencyId: number,
  body: CurrencyReq,
): Promise<Currency | null> => {
  logger.info(
    "entering::updateIdCurrencyServiceValidation::service::validation",
  );
  validIdCheck(currencyId);

  const existingCurrency = await getCurrencyByIdFromDb(currencyId);
  if (!existingCurrency || existingCurrency.isActive === false) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "currency"));
  }

  const currencyWithSameName = await getCurrencyByCurrencyNameFromDb(body.name);
  if (currencyWithSameName && currencyWithSameName.isActive) {
    if (currencyWithSameName.id !== currencyId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Currency name"),
      );
    }
  }

  const currencyWithSameCodeName = await getCurrencyByCurrencyCodeNameFromDb(
    body.code,
  );
  if (currencyWithSameCodeName && currencyWithSameCodeName.isActive) {
    if (currencyWithSameCodeName.id !== currencyId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Currency code Name"),
      );
    }
  }
  logger.info(
    "exiting::updateIdCurrencyServiceValidation::service::validation",
  );
  return null;
};

export const nameCurrencyServiceValidation = async (
  name: string,
): Promise<void> => {
  logger.info("entering::nameCurrencyServiceValidation::service::validation");
  const currency = await getCurrencyByCurrencyNameFromDb(name);
  if (currency && currency.isActive) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "currency"),
    );
  }
  logger.info("exiting::nameCurrencyServiceValidation::service::validation");
  return;
};

export const createCurrencyServiceValidation = async (
  body: CurrencyReq,
): Promise<Currency | null> => {
  logger.info("entering::createCurrencyServiceValidation::service::validation");
  const currencyName = await getCurrencyByCurrencyNameFromDb(body.name);
  if (currencyName && currencyName.isActive) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Currency name"),
    );
  }

  const currencyCodeName = await getCurrencyByCurrencyCodeNameFromDb(body.code);
  if (currencyCodeName && currencyCodeName.isActive) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Currency code Name"),
    );
  }

  logger.info("exiting::createCurrencyServiceValidation::service::validation");
  return currencyName || currencyCodeName;
};
