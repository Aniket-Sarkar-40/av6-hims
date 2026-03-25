import {
  createMedDrugInDb,
  getAllMedDrugFromDb,
  getMedDrugByIdFromDb,
  updateMedDrugInDb,
} from "@/repository/master/medDrug.repository.js";
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
  createMedDrugServiceValidation,
  updateIdMedDrugServiceValidation,
} from "@/validations/service/master/medDrug.service.validation.js";

import { MedDrug } from "@repo/db/generated/prisma/client";
const cacheKey = getRedisKey("MED_DRUG", "all");

export const medDrugService = {
  async createMedDrug(input: DropDownName): Promise<DropDownName> {
    logger.info("entering::createMedDrug::service");
    await createMedDrugServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_DRUG);
    const medDrug = await createMedDrugInDb(input);
    if (isCacheable && medDrug) {
      await addToCache(cacheKey, medDrug.id, medDrug);
    }
    logger.info("exiting::createMedDrug::service");
    return medDrug;
  },

  async updateMedDrug(input: DropDownName): Promise<DropDownName> {
    logger.info("entering::updateMedDrug::service");
    if (input.id === undefined) {
      throw new ErrorHandler(400, "ID is required for updating MedDrug");
    }
    await updateIdMedDrugServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_DRUG);
    const updatedMedDrug = await updateMedDrugInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedMedDrug);
    }

    logger.info("exiting::updateMedDrug::service");
    return updatedMedDrug;
  },

  async getAllMedDrug(): Promise<DropDownName[]> {
    logger.info("entering::getAllMedDrug::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_DRUG);
    if (isCacheable) {
      const cachedMedDrug = (await getAllCache(cacheKey)) as MedDrug[] | null;
      if (cachedMedDrug && cachedMedDrug.length > 0) {
        return cachedMedDrug;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Drug"),
        );
      }
    } else {
      const MedDrug = await getAllMedDrugFromDb();
      if (MedDrug.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Drug"),
        );
      }
      logger.info("exiting::getAllMedDrug::service");
      return MedDrug;
    }
  },

  async getMedDrugById(
    medDrugId: number,
    canNullReturnable: boolean = false,
  ): Promise<MedDrug | null> {
    logger.info("entering::getMedDrugById::service");
    validIdCheck(medDrugId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_DRUG);
    let medDrug: MedDrug | null;
    if (isCacheable) {
      medDrug = (await getCacheById(cacheKey, medDrugId)) as MedDrug | null;
    } else {
      medDrug = await getMedDrugByIdFromDb(medDrugId);
    }
    if (!medDrug) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Drug"),
        );
      else return null;
    }

    logger.info("exiting::getMedDrugById::service");
    return medDrug;
  },
};
