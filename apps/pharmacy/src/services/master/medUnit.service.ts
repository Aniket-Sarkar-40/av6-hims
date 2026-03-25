import {
  createMedUnitInDb,
  getAllMedUnitFromDb,
  getMedUnitByIdFromDb,
  updateMedUnitInDb,
} from "@/repository/master/medUnit.repository.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createMedUnitServiceValidation,
  updateIdMedUnitServiceValidation,
} from "@/validations/service/master/medUnit.service.validation.js";
import { MedicineUnit } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("MEDICINE_UNIT", "all");

export const medUnitService = {
  async createMedUnit(input: DropDownName) {
    logger.info("entering::medUnitService::service");
    await createMedUnitServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_UNIT);
    const medUnit = await createMedUnitInDb(input);
    if (isCacheable && medUnit) {
      await addToCache(cacheKey, medUnit.id, medUnit);
    }
    logger.info("exiting::medUnitService::service");
    return medUnit;
  },

  async getAllMedUnit() {
    logger.info("entering::getAllMedUnit::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_UNIT);
    if (isCacheable) {
      const cachedMedUnit = (await getAllCache(cacheKey)) as
        | MedicineUnit[]
        | null;
      if (cachedMedUnit && cachedMedUnit.length > 0) {
        return cachedMedUnit;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Unit"),
        );
      }
    } else {
      const medUnit = await getAllMedUnitFromDb();
      if (medUnit.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Composition"),
        );
      }
      logger.info("exiting::getAllMedCompo::service");
      return medUnit;
    }
  },

  async getMedUnitById(medUnitId: number, canNullReturnable: boolean = false) {
    logger.info("entering::getCMedUnitById::service");
    validIdCheck(medUnitId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_UNIT);
    let medUnit: MedicineUnit | null;
    if (isCacheable) {
      medUnit = (await getCacheById(
        cacheKey,
        medUnitId,
      )) as MedicineUnit | null;
    } else {
      medUnit = await getMedUnitByIdFromDb(medUnitId);
    }
    if (!medUnit) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Composition"),
        );
      else return null;
    }
    logger.info("exiting::getCMedUnitById::service");
    return medUnit;
  },

  async updateMedUnit(input: DropDownName): Promise<MedicineUnit> {
    logger.info("entering::updateMedUnit::service");
    await updateIdMedUnitServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_UNIT);
    const updatedMedUnit = await updateMedUnitInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id!, updatedMedUnit);
    }
    logger.info("exiting::updateMedUnit::service");
    return updatedMedUnit;
  },
};
