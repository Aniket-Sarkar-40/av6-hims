import { auditProxy } from "@/config/audit.config.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { toFetchRateOfExchangeDto } from "@/mapper/master/rateOfExchange.mapper.js";
import { createRateOfExchangeInDb } from "@/repository/master/rateOfExchange.repository.js";
import {
  CreateRateOfExchangeInput,
  FetchRateOfExchangeInput,
} from "@/types/master/rateOfExchange.js";
import {
  createRateOfExchangeServiceValidation,
  fetchRateOfExchangeServiceValidation,
} from "@/validations/service/master/rateOfExchange.service.validation.js";
import { addToCache } from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";
const cacheKey = getRedisKey("RATE_OF_EXCHANGE", "all");

const rateOfExchangeServiceRaw = {
  async createRateOfExchange(input: CreateRateOfExchangeInput) {
    logger.info("entering::createRateOfExchange::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.RATE_OF_EXCHANGE);
    await createRateOfExchangeServiceValidation(input);
    const createdRateOfExchange = await createRateOfExchangeInDb(input);

    if (isCacheable && createdRateOfExchange) {
      await addToCache(
        cacheKey,
        createdRateOfExchange.id,
        createdRateOfExchange,
      );
    }
    logger.info("exiting::createRateOfExchange::service");
    return createdRateOfExchange;
  },
  async fetchRateOfExchange(input: FetchRateOfExchangeInput) {
    logger.info("entering::fetchRateOfExchange::service");
    await fetchRateOfExchangeServiceValidation(input);
    const rate = await toFetchRateOfExchangeDto(input);
    if (!rate) {
      throw new ErrorHandler(
        400,
        "Please configure the rate of exchange for the currency",
      );
    }
    logger.info("exiting::fetchRateOfExchange::service");
    return rate;
  },
};

export const rateOfExchangeService = auditProxy.createAuditedService(
  "rateOfExchange",
  rateOfExchangeServiceRaw,
);
