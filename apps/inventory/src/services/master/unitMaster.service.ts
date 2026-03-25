import {
  createUnitMasterInDb,
  getAllUnitMasterFromDb,
  getUnitMasterByIdFromDb,
  updateUnitMasterInDb,
} from "@/repository/master/unitMaster.repository.js";
import { UnitMasterReq, UnitMasterUpdate } from "@/types/master/unitMaster.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/inventory.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { checkIsCacheable } from "@/config/cache.config.js";
import {
  createUnitMasterServiceValidation,
  updateIdUnitMasterServiceValidation,
} from "@/validations/service/master/unitMaster.service.validation.js";
import { InvUnitMaster } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("UNIT_MASTER", "all");

export const unitMasterService = {
  async createUnitMaster(input: UnitMasterReq): Promise<InvUnitMaster> {
    logger.info("entering::createUnitMaster::service");
    await createUnitMasterServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.UNIT_MASTER);
    const unitMaster = await createUnitMasterInDb(input);
    if (isCacheable && unitMaster) {
      await addToCache(cacheKey, unitMaster.id, unitMaster);
    }
    logger.info("exiting::createUnitMaster::service");
    return unitMaster;
  },

  async updateUnitMaster(input: UnitMasterUpdate): Promise<InvUnitMaster> {
    logger.info("entering::updateUnitMaster::service");
    if (!input.id) {
      throw new ErrorHandler(400, "Unit Master ID is required");
    }
    await updateIdUnitMasterServiceValidation(input);

    const isCacheable = await checkIsCacheable(SHORT_CODE.UNIT_MASTER);
    const updatedUnitMaster = await updateUnitMasterInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedUnitMaster);
    }

    logger.info("exiting::updateUnitMaster::service");
    return updatedUnitMaster;
  },

  async getAllUnitMaster(
    canNullReturnable: boolean = false,
  ): Promise<InvUnitMaster[]> {
    logger.info("entering::getAllUnitMaster::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.UNIT_MASTER);
    let unitMaster: InvUnitMaster[];
    if (isCacheable) {
      unitMaster = (await getAllCache(cacheKey)) as InvUnitMaster[];
    } else {
      unitMaster = await getAllUnitMasterFromDb();
    }
    if (unitMaster.length === 0) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Unit Master"),
        );
      else return [];
    }
    logger.info("exiting::getAllUnitMaster::service");
    return unitMaster;
  },

  async getUnitMasterById(
    unitMasterId: number,
    canNullReturnable: boolean = false,
  ): Promise<InvUnitMaster | null> {
    logger.info("entering::getUnitMasterById::service");
    validIdCheck(unitMasterId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.UNIT_MASTER);
    let unitMaster: InvUnitMaster | null;
    if (isCacheable) {
      unitMaster = (await getCacheById(
        cacheKey,
        unitMasterId,
      )) as InvUnitMaster | null;
    } else {
      unitMaster = await getUnitMasterByIdFromDb(unitMasterId);
    }
    if (!unitMaster) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Unit Master"),
        );
      else return null;
    }

    logger.info("exiting::getUnitMasterById::service");
    return unitMaster;
  },
};
