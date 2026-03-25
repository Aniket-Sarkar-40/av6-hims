import {
  createBoxSizeInDb,
  getAllBoxSizeFromDb,
  getBoxSizeByIdFromDb,
  updateBoxSizeInDb,
} from "@/repository/master/BoxSize.repository.js";
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
  createBoxSizeServiceValidation,
  updateIdBoxSizeServiceValidation,
} from "@/validations/service/master/boxSize.service.validation.js";

import { BoxSize } from "@repo/db/generated/prisma/client";
const cacheKey = getRedisKey("BOX_SIZE", "all");

export const boxSizeService = {
  async createBoxSize(input: DropDownName): Promise<DropDownName> {
    logger.info("entering::createBoxSize::service");
    await createBoxSizeServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.BOX_SIZE);
    const boxSize = await createBoxSizeInDb(input);
    if (isCacheable && boxSize) {
      await addToCache(cacheKey, boxSize.id, boxSize);
    }
    logger.info("exiting::createBoxSize::service");
    return boxSize;
  },

  async updateBoxSize(input: DropDownName): Promise<DropDownName> {
    logger.info("entering::updateBoxSize::service");
    if (input.id === undefined) {
      throw new ErrorHandler(400, "ID is required for updating BoxSize");
    }
    await updateIdBoxSizeServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_DRUG);
    const updatedBoxSize = await updateBoxSizeInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedBoxSize);
    }

    logger.info("exiting::updateBoxSize::service");
    return updatedBoxSize;
  },

  async getAllBoxSize(): Promise<DropDownName[]> {
    logger.info("entering::getAllBoxSize::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_DRUG);
    if (isCacheable) {
      const cachedBoxSize = (await getAllCache(cacheKey)) as BoxSize[] | null;
      if (cachedBoxSize && cachedBoxSize.length > 0) {
        return cachedBoxSize;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Box Size"),
        );
      }
    } else {
      const BoxSize = await getAllBoxSizeFromDb();
      if (BoxSize.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Box Size"),
        );
      }
      logger.info("exiting::getAllBoxSize::service");
      return BoxSize;
    }
  },

  async getBoxSizeById(
    boxSizeId: number,
    canNullReturnable: boolean = false,
  ): Promise<BoxSize | null> {
    logger.info("entering::getBoxSizeById::service");
    validIdCheck(boxSizeId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_DRUG);
    let boxSize: BoxSize | null;
    if (isCacheable) {
      boxSize = (await getCacheById(cacheKey, boxSizeId)) as BoxSize | null;
    } else {
      boxSize = await getBoxSizeByIdFromDb(boxSizeId);
    }
    if (!boxSize) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Box Size"),
        );
      else return null;
    }

    logger.info("exiting::getBoxSizeById::service");
    return boxSize;
  },
};
