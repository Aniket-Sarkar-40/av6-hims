import {
  createExpenseHeadInDb,
  deleteExpenseHeadInDb,
  getAllExpenseHeadsFromDb,
  getExpenseHeadByIdFromDb,
  updateExpenseHeadInDb,
} from "@/repository/master/expenseHead.repository.js";
import {
  createExpenseHeadInput,
  updateExpenseHeadInput,
} from "@/types/master/expenseHead.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getAllCache,
  updateCache,
  getCacheById,
  deleteCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createExpenseHeadServiceValidation,
  deleteExpenseHeadServiceValidation,
  updateExpenseHeadServiceValidation,
} from "@/validations/service/master/expenseHead.service.validation.js";

import { ExpenseHead } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("EXPENSE_HEAD", "all");
export const expenseHeadService = {
  async createExpenseHead(input: createExpenseHeadInput): Promise<ExpenseHead> {
    logger.info("entering::createExpenseHead::service");
    await createExpenseHeadServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.EXPENSE_HEAD);
    const expenseHead = await createExpenseHeadInDb(input);
    if (isCacheable && expenseHead) {
      await addToCache(cacheKey, expenseHead.id, expenseHead);
    }
    logger.info("exiting::createExpenseHead::service");
    return expenseHead;
  },

  async getAllExpenseHeads(): Promise<ExpenseHead[]> {
    logger.info("entering::getAllExpenseHeads::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.EXPENSE_HEAD);
    if (isCacheable) {
      const cachedExpenseHeads = (await getAllCache(cacheKey)) as
        | ExpenseHead[]
        | null;

      if (cachedExpenseHeads && cachedExpenseHeads.length > 0) {
        return cachedExpenseHeads;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Expense Heads"),
        );
      }
    } else {
      const expenseHeads = await getAllExpenseHeadsFromDb();
      if (expenseHeads.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Expense Heads"),
        );
      }
      logger.info("exiting::getAllExpenseHeads::service");
      return expenseHeads;
    }
  },

  async getExpenseHeadById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<ExpenseHead | null> {
    logger.info("entering::getExpenseHeadById::service");
    validIdCheck(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.EXPENSE_HEAD);
    if (isCacheable) {
      const cachedExpenseHead = (await getCacheById(
        cacheKey,
        id,
      )) as ExpenseHead | null;

      if (cachedExpenseHead) {
        return cachedExpenseHead;
      } else {
        if (!canNullReturnable)
          throw new ErrorHandler(
            404,
            generateErrorMessage("NOT_FOUND", "Expense Head"),
          );
        else return null;
      }
    } else {
      const expenseHead = await getExpenseHeadByIdFromDb(id);
      if (!expenseHead) {
        if (!canNullReturnable)
          throw new ErrorHandler(
            404,
            generateErrorMessage("NOT_FOUND", "Expense Head"),
          );
        else return null;
      }
      logger.info("exiting::getExpenseHeadById::service");
      return expenseHead;
    }
  },

  async updateExpenseHead(input: updateExpenseHeadInput): Promise<ExpenseHead> {
    logger.info("entering::updateExpenseHead::service");
    await updateExpenseHeadServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.EXPENSE_HEAD);
    const expenseHead = await updateExpenseHeadInDb(input);
    if (isCacheable && expenseHead) {
      await updateCache(cacheKey, expenseHead.id, expenseHead);
    }
    logger.info("exiting::updateExpenseHead::service");
    return expenseHead;
  },

  async deleteExpenseHead(id: number): Promise<{ message: string }> {
    logger.info("entering::deleteExpenseHead::service");
    await deleteExpenseHeadServiceValidation(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.EXPENSE_HEAD);
    await deleteExpenseHeadInDb(id);
    if (isCacheable) {
      await deleteCache(cacheKey, id);
    }
    logger.info("exiting::deleteExpenseHead::service");
    return { message: "Expense Head deleted successfully" };
  },
};
