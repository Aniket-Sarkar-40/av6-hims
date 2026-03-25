import { db } from "@repo/db/client";
import { commonCreateUpdateValidationMapping } from "@/mapper/commonValidation.mapper.js";
import { dtoMapping } from "@/mapper/dtoMapping.js";
import { mappingExport, mappingImport } from "@/mapper/excelMapping.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/core.shortCode.utils.js";
import * as prismaClient from "@repo/db/generated/prisma/client";
import { commonService, NotificationEmitter, uinConfigService } from "av6-core";
import {
  envMode,
  MASTER_TABLES,
  REDIS_PREFIX,
} from "@repo/shared/config/index.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import {
  addToCache,
  createCache,
  deleteCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "./cache.config.js";

export const commonServiceFactory = commonService({
  cacheAdapter: {
    createCache: createCache,
    deleteCache: deleteCache,
    getCacheById: getCacheById,
    updateCache: updateCache,
    addToCache: addToCache,
  },
  config: {
    CACHE_KEY_NAME: "av6",
    REDIS_PREFIX: REDIS_PREFIX,
    MASTER_CACHE_KEY_NAME: "master",
    MASTER_KEY_MODELS: MASTER_TABLES,
  },
  db: db,
  helpers: {
    ErrorHandler: ErrorHandler,
    generateErrorMessage: generateErrorMessage,
  },
  logger: logger,
  mapper: {
    dtoMapping: dtoMapping,
    validationMapping: commonCreateUpdateValidationMapping,
    mappingExport: mappingExport,
    mappingImport: mappingImport,
  },
  requestStorage: requestStorage,
});

export const uinServiceFactory = uinConfigService({
  cacheAdapter: {
    createCache: createCache,
    deleteCache: deleteCache,
    getCacheById: getCacheById,
    updateCache: updateCache,
    addToCache: addToCache,
    checkIsCacheable: checkIsCacheable,
  },
  cacheKey: getRedisKey("UIN_CONFIG", "all"),

  db: db,
  helpers: {
    ErrorHandler: ErrorHandler,
    generateErrorMessage: generateErrorMessage,
  },
  logger: logger,
  prisma: prismaClient,
  shortCode: SHORT_CODE.UIN_CONFIG,
  requestStorage: requestStorage,
});

export const notifier = new NotificationEmitter({
  prisma: db,
  logger,
  envMode:
    envMode.toLowerCase() === "production" ? "Production" : "Development",
  helpers: {
    ErrorHandler: ErrorHandler,
    generateErrorMessage: generateErrorMessage,
  },
});
