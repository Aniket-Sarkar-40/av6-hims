import {
  createMedicineDistMapInDb,
  updateMedicineDistMapInDb,
} from "@/repository/master/medicineDistMap.repository.js";
import { MedicineDistMapReq } from "@/types/master/medicineDistMap.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { addToCache, updateCache } from "@repo/platform/cache/redis.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import { MedicineDistributorMap } from "@repo/db/generated/prisma/client";
import {
  createMedicineDistMapServiceValidation,
  updateIdMedicineDistMapServiceValidation,
} from "@/validations/service/master/medicineDistMap.service.validation.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
const cacheKey = getRedisKey("MED_DIST_MAP", "all");

export const medicineDistMapService = {
  async createMedicineDistMap(
    input: MedicineDistMapReq,
  ): Promise<MedicineDistributorMap> {
    logger.info("entering::createMedicineDistMap::service");
    await createMedicineDistMapServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_DIST_MAP);
    const medicineDistMap = await createMedicineDistMapInDb(input);
    if (isCacheable && medicineDistMap) {
      await addToCache(cacheKey, medicineDistMap.id, medicineDistMap);
    }
    logger.info("exiting::createMedicineDistMap::service");
    return medicineDistMap;
  },

  async updateMedicineDistMap(
    input: MedicineDistMapReq,
  ): Promise<MedicineDistributorMap> {
    logger.info("entering::updateMedicineDistMap::service");
    if (input.id === undefined) {
      throw new ErrorHandler(
        400,
        "ID is required for updating Collection Center",
      );
    }
    await updateIdMedicineDistMapServiceValidation(input.id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_DIST_MAP);
    const updatedMedicineDistMap = await updateMedicineDistMapInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedMedicineDistMap);
    }

    logger.info("exiting::updateMedicineDistMap::service");
    return updatedMedicineDistMap;
  },
};
