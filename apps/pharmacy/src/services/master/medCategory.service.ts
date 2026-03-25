import {
  toMedCategoryDTO,
  toMedCategoryDTOs,
} from "@/mapper/master/medCategory.mapper.js";
import {
  createMedCategoryInDb,
  getAllMedCategoryFromDb,
  getMedCategoryByIdFromDb,
  updateMedCategoryInDb,
} from "@/repository/master/medCategory.repository.js";
import {
  MedCategoryDTO,
  MedCategoryInput,
} from "@/types/master/medCategory.js";
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
  createMedCategoryServiceValidation,
  updateIdMedCategoryServiceValidation,
} from "@/validations/service/master/medCategory.service.validation.js";
import { MedCategory } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("MED_CATEGORY", "all");

export const medCategoryService = {
  async createMedCategory(input: MedCategoryInput): Promise<MedCategoryDTO> {
    logger.info("entering::createMedCategory::service");
    await createMedCategoryServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_CATEGORY);
    const medCategory = await createMedCategoryInDb(input);
    if (isCacheable && medCategory) {
      await addToCache(cacheKey, medCategory.id, medCategory);
    }
    logger.info("exiting::createMedCategory::service");
    return toMedCategoryDTO(medCategory);
  },

  async updateMedCategory(input: MedCategoryInput): Promise<MedCategoryDTO> {
    logger.info("entering::updateMedCategory::service");
    if (input.id === undefined) {
      throw new ErrorHandler(
        400,
        "ID is required for updating Medicine Category",
      );
    }
    await updateIdMedCategoryServiceValidation(input.id, input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_CATEGORY);
    const updatedMedCategory = await updateMedCategoryInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedMedCategory);
    }

    logger.info("exiting::updateMedCategory::service");
    return toMedCategoryDTO(updatedMedCategory);
  },

  async getAllMedCategory(): Promise<MedCategoryDTO[]> {
    logger.info("entering::getAllMedCategory::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_CATEGORY);
    if (isCacheable) {
      const cachedMedCategory = (await getAllCache(cacheKey)) as
        | MedCategory[]
        | null;
      if (cachedMedCategory && cachedMedCategory.length > 0) {
        return toMedCategoryDTOs(cachedMedCategory);
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Category"),
        );
      }
    } else {
      const MedCategory = await getAllMedCategoryFromDb();
      if (MedCategory.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Category"),
        );
      }
      logger.info("exiting::getAllMedCategory::service");
      return toMedCategoryDTOs(MedCategory);
    }
  },

  async getMedCategoryById(
    medCategoryId: number,
    canNullReturnable: boolean = false,
  ): Promise<MedCategoryDTO | null> {
    logger.info("entering::getMedCategoryById::service");
    validIdCheck(medCategoryId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_CATEGORY);
    let medCategory: MedCategory | null;
    if (isCacheable) {
      medCategory = (await getCacheById(
        cacheKey,
        medCategoryId,
      )) as MedCategory | null;
    } else {
      medCategory = await getMedCategoryByIdFromDb(medCategoryId);
    }
    if (!medCategory) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Category"),
        );
      else return null;
    }

    logger.info("exiting::getMedCategoryById::service");
    return toMedCategoryDTO(medCategory);
  },
  async getMedCategoryByIdWODto(
    medCategoryId: number,
    canNullReturnable: boolean = false,
  ): Promise<MedCategory | null> {
    logger.info("entering::getMedCategoryById::service");
    validIdCheck(medCategoryId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_CATEGORY);
    let medCategory: MedCategory | null;
    if (isCacheable) {
      medCategory = (await getCacheById(
        cacheKey,
        medCategoryId,
      )) as MedCategory | null;
    } else {
      medCategory = await getMedCategoryByIdFromDb(medCategoryId);
    }
    if (!medCategory) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Category"),
        );
      else return null;
    }

    logger.info("exiting::getMedCategoryById::service");
    return medCategory;
  },
};
