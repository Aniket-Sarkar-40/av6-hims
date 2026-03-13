import {
  createServiceEventInDb,
  getAllServiceEventFromDb,
  getServiceEventByIdFromDb,
  updateServiceEventInDb,
} from "@/repository/event/serviceEvent.repository.js";
import { CreateServiceEvent } from "@/types/event/serviceEvent.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/core.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createServiceEventServiceValidation,
  updateIdServiceEventServiceValidation,
} from "@/validations/service/event/serviceEvent.service.validation.js";
import { ServiceEvent } from "@repo/db/generated/prisma/client";
import { checkIsCacheable } from "@/config/cache.config.js";

const cacheKey = getRedisKey("SERVICE_EVENT", "all");

export const serviceEventService = {
  async createServiceEvent(input: CreateServiceEvent): Promise<ServiceEvent> {
    logger.info("entering::createServiceEvent::service");
    await createServiceEventServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.SERVICE_EVENT);

    const serviceEvent = await createServiceEventInDb(input);

    if (isCacheable) {
      await addToCache(cacheKey, serviceEvent.id, serviceEvent);
    }
    logger.info("exiting::createServiceEvent::service");
    return serviceEvent;
  },

  async getAllServiceEvents(
    canNullReturnable: boolean = false
  ): Promise<ServiceEvent[]> {
    logger.info("entering::getAllServiceEvents::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.SERVICE_EVENT);
    let rows: ServiceEvent[] = [];

    if (isCacheable) {
      rows = (await getAllCache(cacheKey)) as ServiceEvent[];
    } else {
      rows = await getAllServiceEventFromDb();
    }

    logger.info("exiting::getAllServiceEvents::service");
    if (!rows) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Service Event")
        );
      }
    }
    return rows;
  },

  async getServiceEventById(
    id: number,
    canNullReturnable: boolean = false
  ): Promise<ServiceEvent | null> {
    logger.info("entering::getServiceEventById::service");
    validIdCheck(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.SERVICE_EVENT);
    let row: ServiceEvent | null = null;

    if (isCacheable) {
      row = (await getCacheById(cacheKey, id)) as ServiceEvent | null;
    } else {
      row = await getServiceEventByIdFromDb(id);
    }

    if (!row) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Service Event")
        );
      }
    }

    logger.info("exiting::getServiceEventById::service");
    return row;
  },
  async updateServiceEvent(
    input: CreateServiceEvent[]
  ): Promise<ServiceEvent[]> {
    logger.info("entering::updateServiceEvent::service");
    await updateIdServiceEventServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.SERVICE_EVENT);

    const result = await updateServiceEventInDb(input);

    if (isCacheable) {
      for (const service of result) {
        await updateCache(cacheKey, service.id, service);
      }
    }

    logger.info("exiting::updateServiceEvent::service");

    return result;
  },
};
