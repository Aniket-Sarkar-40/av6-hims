import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import {
  createDefaultUnitMasterInDb,
  getAllDefaultUnitMasterFromDb,
  getDefaultUnitMasterByIdFromDb,
  updateDefaultUnitMasterInDb,
} from "@/repository/master/defaultUnitMaster.repository.js";
import { DefaultUnitMasterReq } from "@/types/master/defaultUnitMaster.js";
import {
  createDefaultUnitMasterServiceValidation,
  updateIdDefaultUnitMasterServiceValidation,
} from "@/validations/service/master/defaultMaster.service.validation.js";
import { InvDefaultUnitMaster } from "@repo/db/generated/prisma/client";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/inventory.shortCode.utils.js";

const cacheKey = getRedisKey("DEFAULT_UNIT_MASTER", "all");

export const defaultUnitMasterService = {
  async createDefaultUnitMaster(
    input: DefaultUnitMasterReq
  ): Promise<InvDefaultUnitMaster> {
    logger.info("entering::createDefaultUnitMaster::service");
    await createDefaultUnitMasterServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.DEFAULT_UNIT_MASTER);
    const defaultUnitMaster = await createDefaultUnitMasterInDb(input);
    if (isCacheable && defaultUnitMaster) {
      await addToCache(cacheKey, defaultUnitMaster.id, defaultUnitMaster);
    }
    logger.info("exiting::createDefaultUnitMaster::service");
    return defaultUnitMaster;
  },

  async updateDefaultUnitMaster(
    input: DefaultUnitMasterReq
  ): Promise<InvDefaultUnitMaster> {
    logger.info("entering::updateDefaultUnitMaster::service");
    await updateIdDefaultUnitMasterServiceValidation(input);

    const isCacheable = await checkIsCacheable(SHORT_CODE.DEFAULT_UNIT_MASTER);
    const updatedDefaultUnitMaster = await updateDefaultUnitMasterInDb(input);
    if (isCacheable) {
      await updateCache(
        cacheKey,
        updatedDefaultUnitMaster.id,
        updatedDefaultUnitMaster
      );
    }

    logger.info("exiting::updateDefaultUnitMaster::service");
    return updatedDefaultUnitMaster;
  },

  async getAllDefaultUnitMaster(
    canNullReturnable: boolean = false
  ): Promise<InvDefaultUnitMaster[]> {
    logger.info("entering::getAllDefaultUnitMaster::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.DEFAULT_UNIT_MASTER);
    let defaultUnitMaster: InvDefaultUnitMaster[];
    if (isCacheable) {
      defaultUnitMaster = (await getAllCache(
        cacheKey
      )) as InvDefaultUnitMaster[];
    } else {
      defaultUnitMaster = await getAllDefaultUnitMasterFromDb();
    }
    if (defaultUnitMaster.length === 0) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Default Unit Master")
        );
      else return [];
    }
    logger.info("exiting::getAllDefaultUnitMaster::service");
    return defaultUnitMaster;
  },

  async getDefaultUnitMasterById(
    defaultUnitMasterId: number,
    canNullReturnable: boolean = false
  ): Promise<InvDefaultUnitMaster | null> {
    logger.info("entering::getDefaultUnitMasterById::service");
    validIdCheck(defaultUnitMasterId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.DEFAULT_UNIT_MASTER);
    let defaultUnitMaster: InvDefaultUnitMaster | null;
    if (isCacheable) {
      defaultUnitMaster = (await getCacheById(
        cacheKey,
        defaultUnitMasterId
      )) as InvDefaultUnitMaster | null;
    } else {
      defaultUnitMaster = await getDefaultUnitMasterByIdFromDb(
        defaultUnitMasterId
      );
    }
    if (!defaultUnitMaster) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Default Unit Master")
        );
      else return null;
    }

    logger.info("exiting::getDefaultUnitMasterById::service");
    return defaultUnitMaster;
  },
};
