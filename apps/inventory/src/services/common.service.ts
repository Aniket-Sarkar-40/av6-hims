import { commonCreate, commonLockUnlock, commonUpdate, getAll, getByUnique } from "@/repository/common.repository";
import { logger } from "@/utils/logger.utils";
import { addToCache, checkIsCacheable, getAllCache, getCacheById, updateCache } from "@/utils/redisHelper.utils";
import {
  commonCreateValidation,
  commonLockUnlockValidation,
  commonUpdateValidation,
} from "@/validations/service/commonService.validation";
import {
  CommonCreateParams,
  CommonGetAllInput,
  CommonGetByIdInput,
  CommonUpdateParams,
  FullRow,
  LockUnlockParams,
  ModelName,
} from "./../types/common";
import { SHORT_CODE } from "@/utils/shortCode.utils";
import { getRedisKey } from "@/utils/redisKey.utils";
import ErrorHandler from "@/utils/errorHandler.utils";

export const commonService = {
  async lockUnlock(lockParams: LockUnlockParams) {
    logger.info("entering::lock::service");

    const shortCodeData = await commonLockUnlockValidation(lockParams.shortCode, lockParams.id);

    const lockResult = await commonLockUnlock({ ...lockParams, shortCodeData });

    if (lockResult) {
      await updateCache(`inv:${shortCodeData.tableName}:all`, lockParams.id, lockResult);
    }

    logger.info("exiting::lock::service");

    return lockResult;
  },

  async create(createParams: CommonCreateParams) {
    logger.info("entering::create::service");

    const shortCodeData = await commonCreateValidation(createParams.shortCode, createParams.name);

    const createResult = await commonCreate({ ...createParams, shortCodeData });

    if (createResult) {
      await addToCache(`inv:${shortCodeData.tableName}:all`, createResult.id, createResult);
    }

    logger.info("exiting::create::service");
    return createResult;
  },
  async update(updateParams: CommonUpdateParams) {
    logger.info("entering::update::service");

    const shortCodeData = await commonUpdateValidation(updateParams.shortCode, updateParams.id, updateParams.name);

    const updateResult = await commonUpdate({ ...updateParams, shortCodeData });

    if (updateResult) {
      await updateCache(`inv:${shortCodeData.tableName}:all`, updateParams.id, updateResult);
    }

    logger.info("exiting::update::service");
    return updateResult;
  },

  async getElementById<M extends ModelName>(input: CommonGetByIdInput): Promise<FullRow<M> | null> {
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
      if (!input.canNullReturnable) throw new ErrorHandler(404, SHORT_CODE[input.shortCode].replace("_", " "));
    }

    logger.info("exiting::getCommonById::service");
    return row;
  },

  async getAllElements<M extends ModelName>(input: CommonGetAllInput): Promise<FullRow<M>[]> {
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
};
