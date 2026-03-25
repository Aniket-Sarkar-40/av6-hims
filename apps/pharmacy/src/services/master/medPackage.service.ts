import {
  createMedPackageInDb,
  getAllMedPackageFromDb,
  getMedPackageByIdFromDb,
  updateMedPackageInDb,
} from "@/repository/master/medPackage.repository.js";
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
  createMedPackageServiceValidation,
  updateIdMedPackageServiceValidation,
} from "@/validations/service/master/medPackage.service.validation.js";

import { MedPackage } from "@repo/db/generated/prisma/client";
const cacheKey = getRedisKey("MED_PACKAGE", "all");

export const medPackageService = {
  async createMedPackage(input: DropDownName): Promise<DropDownName> {
    logger.info("entering::createMedPackage::service");
    await createMedPackageServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_PACKAGE);
    const medPackage = await createMedPackageInDb(input);
    if (isCacheable && medPackage) {
      await addToCache(cacheKey, medPackage.id, medPackage);
    }
    logger.info("exiting::createMedPackage::service");
    return medPackage;
  },

  async updateMedPackage(input: DropDownName): Promise<DropDownName> {
    logger.info("entering::updateMedPackage::service");
    if (input.id === undefined) {
      throw new ErrorHandler(400, "ID is required for updating MedPackage");
    }
    await updateIdMedPackageServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_PACKAGE);
    const updatedMedPackage = await updateMedPackageInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedMedPackage);
    }

    logger.info("exiting::updateMedPackage::service");
    return updatedMedPackage;
  },

  async getAllMedPackage(): Promise<DropDownName[]> {
    logger.info("entering::getAllMedPackage::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_PACKAGE);
    if (isCacheable) {
      const cachedMedPackage = (await getAllCache(cacheKey)) as
        | MedPackage[]
        | null;
      if (cachedMedPackage && cachedMedPackage.length > 0) {
        return cachedMedPackage;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Package"),
        );
      }
    } else {
      const MedPackage = await getAllMedPackageFromDb();
      if (MedPackage.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Package"),
        );
      }
      logger.info("exiting::getAllMedPackage::service");
      return MedPackage;
    }
  },

  async getMedPackageById(
    medPackageId: number,
    canNullReturnable: boolean = false,
  ): Promise<MedPackage | null> {
    logger.info("entering::getMedPackageById::service");
    validIdCheck(medPackageId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_PACKAGE);
    let medPackage: MedPackage | null;
    if (isCacheable) {
      medPackage = (await getCacheById(
        cacheKey,
        medPackageId,
      )) as MedPackage | null;
    } else {
      medPackage = await getMedPackageByIdFromDb(medPackageId);
    }
    if (!medPackage) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Package"),
        );
      else return null;
    }

    logger.info("exiting::getMedPackageById::service");
    return medPackage;
  },
};
