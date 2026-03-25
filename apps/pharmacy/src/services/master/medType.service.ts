import {
  createMedTypeInDb,
  getAllMedTypeFromDb,
  getMedTypeByIdFromDb,
  updateMedTypeInDb,
} from "@/repository/master/medType.repository.js";
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
  createMedTypeServiceValidation,
  updateIdMedTypeServiceValidation,
} from "@/validations/service/master/medType.service.validation.js";

import { MedType } from "@repo/db/generated/prisma/client";
const cacheKey = getRedisKey("MED_TYPE", "all");

export const medTypeService = {
  async createMedType(input: DropDownName): Promise<DropDownName> {
    logger.info("entering::createMedType::service");
    await createMedTypeServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_TYPE);
    const medType = await createMedTypeInDb(input);
    if (isCacheable && medType) {
      await addToCache(cacheKey, medType.id, medType);
    }
    logger.info("exiting::createMedType::service");
    return medType;
  },

  async updateMedType(input: DropDownName): Promise<DropDownName> {
    logger.info("entering::updateMedType::service");
    if (input.id === undefined) {
      throw new ErrorHandler(400, "ID is required for updating Medicine Type");
    }
    await updateIdMedTypeServiceValidation(input.id, input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_TYPE);
    const updatedMedType = await updateMedTypeInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedMedType);
    }

    logger.info("exiting::updateMedType::service");
    return updatedMedType;
  },

  async getAllMedType(): Promise<DropDownName[]> {
    logger.info("entering::getAllMedType::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_TYPE);
    if (isCacheable) {
      const cachedMedType = (await getAllCache(cacheKey)) as MedType[] | null;
      if (cachedMedType && cachedMedType.length > 0) {
        return cachedMedType;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Type"),
        );
      }
    } else {
      const medType = await getAllMedTypeFromDb();
      if (medType.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Type"),
        );
      }
      logger.info("exiting::getAllMedType::service");
      return medType;
    }
  },

  async getMedTypeById(
    medTypeId: number,
    canNullReturnable: boolean = false,
  ): Promise<MedType | null> {
    logger.info("entering::getMedTypeById::service");
    validIdCheck(medTypeId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_TYPE);
    let medType: MedType | null;
    if (isCacheable) {
      medType = (await getCacheById(cacheKey, medTypeId)) as MedType | null;
    } else {
      medType = await getMedTypeByIdFromDb(medTypeId);
    }
    if (!medType) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Type"),
        );
      else return null;
    }

    logger.info("exiting::getMedTypeById::service");
    return medType;
  },
};
