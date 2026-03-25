import {
  createManufactureInDb,
  getAllManufactureFromDb,
  getManufactureByIdFromDb,
  updateManufactureInDb,
} from "@/repository/master/manufacture.repository.js";
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
  createManufactureServiceValidation,
  updateIdManufactureServiceValidation,
} from "@/validations/service/master/manufacture.service.validation.js";
import { Manufacture } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("MANUFACTURE", "all");

export const manufactureService = {
  async createManufacture(input: DropDownName): Promise<DropDownName> {
    logger.info("entering::createManufacture::service");
    await createManufactureServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MANUFACTURE);
    const manufacture = await createManufactureInDb(input);
    if (isCacheable && manufacture) {
      await addToCache(cacheKey, manufacture.id, manufacture);
    }
    logger.info("exiting::createManufacture::service");
    return manufacture;
  },

  async updateManufacture(input: DropDownName): Promise<DropDownName> {
    logger.info("entering::updateManufacture::service");
    if (input.id === undefined) {
      throw new ErrorHandler(400, "ID is required for updating Manufacture");
    }
    await updateIdManufactureServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MANUFACTURE);
    const updatedManufacture = await updateManufactureInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedManufacture);
    }

    logger.info("exiting::updateManufacture::service");
    return updatedManufacture;
  },

  async getAllManufacture(): Promise<DropDownName[]> {
    logger.info("entering::getAllManufacture::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.MANUFACTURE);
    if (isCacheable) {
      const cachedManufacture = (await getAllCache(cacheKey)) as
        | Manufacture[]
        | null;
      if (cachedManufacture && cachedManufacture.length > 0) {
        return cachedManufacture;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Drug"),
        );
      }
    } else {
      const Manufacture = await getAllManufactureFromDb();
      if (Manufacture.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Drug"),
        );
      }
      logger.info("exiting::getAllManufacture::service");
      return Manufacture;
    }
  },

  async getManufactureById(
    manufactureId: number,
    canNullReturnable: boolean = false,
  ): Promise<Manufacture | null> {
    logger.info("entering::getManufactureById::service");
    validIdCheck(manufactureId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MANUFACTURE);
    let manufacture: Manufacture | null;
    if (isCacheable) {
      manufacture = (await getCacheById(
        cacheKey,
        manufactureId,
      )) as Manufacture | null;
    } else {
      manufacture = await getManufactureByIdFromDb(manufactureId);
    }
    if (!manufacture) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Drug"),
        );
      else return null;
    }

    logger.info("exiting::getManufactureById::service");
    return manufacture;
  },
};
