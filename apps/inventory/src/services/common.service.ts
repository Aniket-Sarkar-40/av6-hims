import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import {
  commonActiveInactive,
  commonLockUnlock,
  getAll,
  getByUnique,
} from "@/repository/common.repository.js";
import {
  CommonActiveInactiveParams,
  CommonGetAllInput,
  CommonGetByIdInput,
  FullRow,
  LockUnlockParams,
  ModelName,
} from "@/types/common.js";
import {
  commonActiveInactiveValidation,
  commonLockUnlockValidation,
} from "@/validations/service/commonService.validation.js";
import {
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/inventory.shortCode.utils.js";

export const commonService = {
  async lockUnlock(lockParams: LockUnlockParams) {
    logger.info("entering::lock::service");

    const shortCodeData = await commonLockUnlockValidation(
      lockParams.shortCode,
      lockParams.id,
    );

    const lockResult = await commonLockUnlock({ ...lockParams, shortCodeData });

    if (lockResult) {
      await updateCache(
        `inv:${shortCodeData.tableName}:all`,
        lockParams.id,
        lockResult,
      );
    }

    logger.info("exiting::lock::service");

    return lockResult;
  },

  async getElementById<M extends ModelName>(
    input: CommonGetByIdInput,
  ): Promise<FullRow<M> | null> {
    logger.info("entering::getCommonById::service");
    const cacheKey = getRedisKey(input.cacheCode, "all");

    const isCacheable = await checkIsCacheable(SHORT_CODE[input.shortCode]);
    let row: FullRow<M> | null = null;

    if (isCacheable) {
      row = (await getCacheById(cacheKey, input.id)) as FullRow<M> | null;
    } else {
      row = await getByUnique<M>({
        model: input.modelName as M,
        where: {
          id: input.id,
        },
        useActiveFlag: input.useActiveFlag,
      });
    }

    if (!row) {
      if (!input.canNullReturnable)
        throw new ErrorHandler(
          404,
          SHORT_CODE[input.shortCode].replace("_", " "),
        );
    }

    logger.info("exiting::getCommonById::service");
    return row;
  },

  async getAllElements<M extends ModelName>(
    input: CommonGetAllInput,
  ): Promise<FullRow<M>[]> {
    logger.info("entering::getCommons::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE[input.shortCode]);
    const cacheKey = getRedisKey(input.cacheCode, "all");

    let rows: FullRow<M>[] = [];
    if (isCacheable) {
      rows = (await getAllCache(cacheKey)) as FullRow<M>[];
    } else {
      rows = await getAll<M>({
        model: input.modelName as M,
        where: {},
        useActiveFlag: input.useActiveFlag,
      });
    }
    logger.info("exiting::getCommons::service");
    return rows;
  },

  async activeInactive(activeInactiveParams: CommonActiveInactiveParams) {
    logger.info("entering::activeInactive::service");

    const { shortCodeData, normalizedValue } =
      await commonActiveInactiveValidation(
        activeInactiveParams.shortCode,
        activeInactiveParams.id,
        activeInactiveParams.field,
        activeInactiveParams.value,
      );

    const result = await commonActiveInactive({
      ...activeInactiveParams,
      value: normalizedValue,
      shortCodeData,
    });

    if (result) {
      await updateCache(
        `inv:${shortCodeData.tableName}:all`,
        activeInactiveParams.id,
        result,
      );
    }

    logger.info("exiting::activeInactive::service");

    return result;
  },
};
