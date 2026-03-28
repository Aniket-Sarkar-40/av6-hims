import {
  createMedDosageInDb,
  getAllMedDosageFromDb,
  getMedDosageByIdFromDb,
  updateMedDosageInDb,
} from "@/repository/master/medDosage.repository.js";
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
  createMedDosageServiceValidation,
  updateIdMedDosageServiceValidation,
} from "@/validations/service/master/medDosage.service.validation.js";
import { MedicineDosage } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("MED_DOSAGE", "all");

export const medDosageService = {
  async createMedDosage(input: DropDownName) {
    logger.info("entering::medDosageService::service");
    await createMedDosageServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.DOSAGE);
    const medDosage = await createMedDosageInDb(input);
    if (isCacheable && medDosage) {
      await addToCache(cacheKey, medDosage.id, medDosage);
    }
    logger.info("exiting::medDosageService::service");
    return medDosage;
  },

  async getAllMedDosage() {
    logger.info("entering::getAllMedDosage::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.DOSAGE);
    if (isCacheable) {
      const cachedMedDosage = (await getAllCache(cacheKey)) as
        | MedicineDosage[]
        | null;
      if (cachedMedDosage && cachedMedDosage.length > 0) {
        return cachedMedDosage;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Dosage"),
        );
      }
    } else {
      const medDosage = await getAllMedDosageFromDb();
      if (medDosage.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Composition"),
        );
      }
      logger.info("exiting::getAllMedCompo::service");
      return medDosage;
    }
  },

  async getMedDosageById(
    medDosageId: number,
    canNullReturnable: boolean = false,
  ) {
    logger.info("entering::getCMedDosageById::service");
    validIdCheck(medDosageId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.DOSAGE);
    let medDosage: MedicineDosage | null;
    if (isCacheable) {
      medDosage = (await getCacheById(
        cacheKey,
        medDosageId,
      )) as MedicineDosage | null;
    } else {
      medDosage = await getMedDosageByIdFromDb(medDosageId);
    }
    if (!medDosage) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Composition"),
        );
      else return null;
    }
    logger.info("exiting::getCMedDosageById::service");
    return medDosage;
  },

  async updateMedDosage(input: DropDownName): Promise<MedicineDosage> {
    logger.info("entering::updateMedDosage::service");
    await updateIdMedDosageServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.DOSAGE);
    const updatedMedDosage = await updateMedDosageInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id!, updatedMedDosage);
    }
    logger.info("exiting::updateMedDosage::service");
    return updatedMedDosage;
  },
};
