import {
  createUnitMasterInDb,
  getAllUnitMasterFromDb,
  getUnitMasterByIdFromDb,
  updateUnitMasterInDb,
} from "@/repository/master/unitMaster.repository";
import { UnitMasterReq, UnitMasterUpdate } from "@/types/master/unitMaster";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import { addToCache, checkIsCacheable, getAllCache, getCacheById, updateCache } from "@/utils/redisHelper.utils";
import { getRedisKey } from "@/utils/redisKey.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { SHORT_CODE } from "@/utils/shortCode.utils";
import { validIdCheck } from "@/validations/global.validation";
import {
  createUnitMasterServiceValidation,
  updateIdUnitMasterServiceValidation,
} from "@/validations/service/master/unitMaster.service.validation";
import { UnitMaster } from "@prisma/client";

const cacheKey = getRedisKey("UNIT_MASTER", "all");

export const unitMasterService = {
  async createUnitMaster(input: UnitMasterReq): Promise<UnitMaster> {
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

  async updateUnitMaster(input: UnitMasterUpdate): Promise<UnitMaster> {
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

  async getAllUnitMaster(canNullReturnable: boolean = false): Promise<UnitMaster[]> {
    logger.info("entering::getAllUnitMaster::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.UNIT_MASTER);
    let unitMaster: UnitMaster[];
    if (isCacheable) {
      unitMaster = (await getAllCache(cacheKey)) as UnitMaster[];
    } else {
      unitMaster = await getAllUnitMasterFromDb();
    }
    if (unitMaster.length === 0) {
      if (!canNullReturnable) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Unit Master"));
      else return [];
    }
    logger.info("exiting::getAllUnitMaster::service");
    return unitMaster;
  },

  async getUnitMasterById(unitMasterId: number, canNullReturnable: boolean = false): Promise<UnitMaster | null> {
    logger.info("entering::getUnitMasterById::service");
    validIdCheck(unitMasterId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.UNIT_MASTER);
    let unitMaster: UnitMaster | null;
    if (isCacheable) {
      unitMaster = (await getCacheById(cacheKey, unitMasterId)) as UnitMaster | null;
    } else {
      unitMaster = await getUnitMasterByIdFromDb(unitMasterId);
    }
    if (!unitMaster) {
      if (!canNullReturnable) throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Unit Master"));
      else return null;
    }

    logger.info("exiting::getUnitMasterById::service");
    return unitMaster;
  },
};
