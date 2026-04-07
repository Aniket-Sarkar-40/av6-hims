// src/services/master/incomeHead.service.ts
import {
  CreateIncomeHeadInput,
  UpdateIncomeHeadInput,
} from "@/types/master/incomeHead.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  deleteCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

import { IncomeHead } from "@repo/db/generated/prisma/client";
import {
  createIncomeHeadInDb,
  deleteIncomeHeadInDb,
  getAllIncomeHeadFromDb,
  getIncomeHeadByIdFromDb,
  updateIncomeHeadInDb,
} from "@/repository/master/incomeHead.repository.js";
import {
  createIncomeHeadServiceValidation,
  updateIdIncomeHeadServiceValidation,
  validateIdIncomeHead,
} from "@/validations/service/master/incomeHead.service.validation.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/core.shortCode.utils.js";

const cacheKey = getRedisKey("INCOME_HEAD", "all");

export const incomeHeadService = {
  async createIncomeHead(input: CreateIncomeHeadInput): Promise<IncomeHead> {
    logger.info("entering::createIncomeHead::service");
    await createIncomeHeadServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.INCOME_HEAD);
    const newIncomeHead = await createIncomeHeadInDb(input);

    if (isCacheable && newIncomeHead) {
      await addToCache(cacheKey, newIncomeHead.id, newIncomeHead);
    }

    logger.info("exiting::createIncomeHead::service");
    return newIncomeHead;
  },

  async updateIncomeHead(input: UpdateIncomeHeadInput): Promise<IncomeHead> {
    logger.info("entering::updateIncomeHead::service");

    await updateIdIncomeHeadServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.INCOME_HEAD);
    const updatedIncomeHead = await updateIncomeHeadInDb(input);

    if (isCacheable && updatedIncomeHead) {
      await updateCache(cacheKey, input.id, updatedIncomeHead);
    }

    logger.info("exiting::updateIncomeHead::service");
    return updatedIncomeHead;
  },

  async getAllIncomeHead(): Promise<IncomeHead[]> {
    logger.info("entering::getAllIncomeHead::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.INCOME_HEAD);

    if (isCacheable) {
      const cached = (await getAllCache(cacheKey)) as IncomeHead[] | null;
      if (cached && cached.length > 0) {
        return cached;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Income Head")
        );
      }
    } else {
      const all = await getAllIncomeHeadFromDb();
      if (all.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Income Head")
        );
      }
      logger.info("exiting::getAllIncomeHead::service");
      return all;
    }
  },

  async getIncomeHeadById(
    incomeHeadId: number,
    canNullReturnable: boolean = false
  ): Promise<IncomeHead | null> {
    logger.info("entering::getIncomeHeadById::service");
    validIdCheck(incomeHeadId);

    const isCacheable = await checkIsCacheable(SHORT_CODE.INCOME_HEAD);
    let record: IncomeHead | null;

    if (isCacheable) {
      record = (await getCacheById(
        cacheKey,
        incomeHeadId
      )) as IncomeHead | null;
    } else {
      record = await getIncomeHeadByIdFromDb(incomeHeadId);
    }

    if (!record) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Income Head")
        );
      }
      return null;
    }

    logger.info("exiting::getIncomeHeadById::service");
    return record;
  },
  async deleteIncomeHead(incomeHeadID: number): Promise<{ message: string }> {
    logger.info("entering::deleteCity::service");
    await validateIdIncomeHead(incomeHeadID);
    const isCacheable = await checkIsCacheable(SHORT_CODE.INCOME_HEAD);
    await deleteIncomeHeadInDb(incomeHeadID);
    if (isCacheable) {
      await deleteCache(cacheKey, incomeHeadID);
    }
    logger.info("exiting::deleteCity::service");
    return { message: "city deleted successfully" };
  },
};
