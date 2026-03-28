import {
  createCurrencyInDb,
  deleteCurrencyInDb,
  getAllCurrencyFromDb,
  getCurrencyByIdFromDb,
  updateActiveCurrencyInDb,
  updateCurrencyInDb,
} from "@/repository/master/currency.repository.js";
import { CurrencyReq } from "@/types/master/currency.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  deleteCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { getMasterRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/inventory.shortCode.utils.js";
import { checkIsCacheable } from "@/config/cache.config.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createCurrencyServiceValidation,
  deleteCurrencyServiceValidation,
  updateIdCurrencyServiceValidation,
} from "@/validations/service/master/currency.service.validation.js";

import { Currency } from "@repo/db/generated/prisma/client";

const cacheKey = getMasterRedisKey("CURRENCY", "all");

export const currencyService = {
  async createCurrency(input: CurrencyReq): Promise<Currency> {
    logger.info("entering::createCurrency::service");
    const prevCurrency = await createCurrencyServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.CURRENCY);
    let currency: Currency | null = null;
    if (!prevCurrency) {
      currency = await createCurrencyInDb(input);
    } else {
      currency = await updateActiveCurrencyInDb(prevCurrency.id);
    }
    if (isCacheable && currency) {
      await addToCache(cacheKey, currency.id, currency);
    }
    logger.info("exiting::createCurrency::service");
    return currency;
  },

  async getAllCurrency(
    canNullReturnable: boolean = false,
  ): Promise<Currency[]> {
    logger.info("entering::getAllCurrency::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.CURRENCY);
    let currencies: Currency[] = [];

    if (isCacheable) {
      currencies = (await getAllCache(cacheKey)) as Currency[];
    } else {
      currencies = await getAllCurrencyFromDb();
    }

    logger.info("exiting::getAllCurrency::service");
    if (currencies.length === 0) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Currency"),
        );
      } else {
        return [];
      }
    }
    return currencies;
  },

  async getCurrencyById(
    currencyId: number,
    canNullReturnable: boolean = false,
  ): Promise<Currency | null> {
    logger.info("entering::getCurrencyById::service");
    validIdCheck(currencyId);

    const isCacheable = await checkIsCacheable(SHORT_CODE.CURRENCY);
    let currency: Currency | null;

    if (isCacheable) {
      currency = (await getCacheById(cacheKey, currencyId)) as Currency | null;
    } else {
      currency = await getCurrencyByIdFromDb(currencyId);
    }

    if (currency === null) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "currency"),
        );
      else return null;
    }

    logger.info("exiting::getCurrencyById::service");
    return currency;
  },
  async updateCurrency(input: CurrencyReq): Promise<Currency> {
    logger.info("entering::updateCurrency::service");

    await updateIdCurrencyServiceValidation(input);

    const isCacheable = await checkIsCacheable(SHORT_CODE.CURRENCY);

    const updatedCurrency = await updateCurrencyInDb(input);

    if (isCacheable) {
      await updateCache(cacheKey, updatedCurrency.id, updatedCurrency);
      logger.info("Updated currency in cache for ID: " + updatedCurrency.id);
    }

    logger.info("exiting::updateCurrency::service");

    return updatedCurrency;
  },
  async deleteCurrency(currencyId: number): Promise<{ message: string }> {
    logger.info("entering::deleteCurrency::service");
    await deleteCurrencyServiceValidation(currencyId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.CURRENCY);
    await deleteCurrencyInDb(currencyId);
    if (isCacheable) {
      await deleteCache(cacheKey, currencyId);
    }
    logger.info("exiting::deleteCurrency::service");
    return { message: "currency deleted successfully" };
  },
};
