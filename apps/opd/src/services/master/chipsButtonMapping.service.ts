import {
  createChipsButtonMappingInDb,
  getChipsButtonMappingByIdFromDb,
  updateChipsButtonMappingInDb,
} from "@/repository/master/chipsButtonMapping.repository.js";
import { CreateOrUpdateChipsButtonMapping } from "@/types/master/chipsButtonMapping.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { getRedisKey } from "@/config/cache.config.js";
import { checkIsCacheable } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/opd.shortCode.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  createChipsButtonMappingServiceValidation,
  updateIdChipsButtonMappingServiceValidation,
} from "@/validations/service/master/chipsButtonMapping.service.validation.js";
import { ChipsButtonMapping } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("CHIPS_BUTTON_MAPPING", "all");

export const chipsButtonMappingService = {
  async createChipsButtonMapping(input: CreateOrUpdateChipsButtonMapping) {
    logger.info("entering::createChipsButtonMapping::service");

    await createChipsButtonMappingServiceValidation(input);

    const isCacheable = await checkIsCacheable(SHORT_CODE.CHIPS_BUTTON_MAPPING);

    const created = await createChipsButtonMappingInDb(input);

    if (isCacheable) {
      await addToCache(cacheKey, created.id, created);
    }

    logger.info("exiting::createChipsButtonMapping::service");
    return created;
  },

  async getChipsButtonMappingById(
    id: number,
    canNullReturnable: boolean = false,
  ) {
    logger.info("entering::getChipsButtonMappingById::service");

    validIdCheck(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.CHIPS_BUTTON_MAPPING);
    let row: ChipsButtonMapping | null = null;

    if (isCacheable) {
      row = (await getCacheById(cacheKey, id)) as ChipsButtonMapping | null;
    } else {
      row = await getChipsButtonMappingByIdFromDb(id);
    }

    if (!row) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Chips Button Mapping"),
        );
      else return null;
    }

    logger.info("exiting::getChipsButtonMappingById::service");
    return row;
  },

  async updateChipsButtonMapping(input: CreateOrUpdateChipsButtonMapping) {
    logger.info("entering::updateChipsButtonMapping::service");
    await updateIdChipsButtonMappingServiceValidation(input);
    validIdCheck(input.id as number);

    const isCacheable = await checkIsCacheable(SHORT_CODE.CHIPS_BUTTON_MAPPING);

    const updated = await updateChipsButtonMappingInDb(input);

    if (isCacheable) {
      await updateCache(cacheKey, updated.id, updated);
    }

    logger.info("exiting::updateChipsButtonMapping::service");

    return updated;
  },
};
