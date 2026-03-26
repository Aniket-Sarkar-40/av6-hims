import { dtoMapping } from "@/mapper/dtoMapping.js";
import { mappingExport, mappingImport } from "@/mapper/excelMapping.js";
import { db } from "@repo/db";
import {
  addToCache,
  createCache,
  deleteCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import { MASTER_TABLES, REDIS_PREFIX } from "@repo/shared";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { commonService, uinConfigService } from "av6-core";
import { checkIsCacheable, getRedisKey } from "./cache.config.js";
import { PrismaClient } from "@repo/db/generated/prisma/client";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";

export const commonServiceFactory = commonService({
  cacheAdapter: {
    createCache: createCache,
    deleteCache: deleteCache,
    getCacheById: getCacheById,
    updateCache: updateCache,
    addToCache: addToCache,
  },
  config: {
    CACHE_KEY_NAME: "pms",
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
  prisma: PrismaClient,
  shortCode: SHORT_CODE.UIN_CONFIG,
  requestStorage: requestStorage,
});
