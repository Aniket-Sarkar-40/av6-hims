import { auditProxy } from "@/config/audit.config.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import {
  CreateOrUpdateAuditConfigInDb,
  getAllAuditConfigFromDb,
  getAuditConfigByIdFromDb,
  updateAuditConfigInDb,
} from "@/repository/master/auditConfig.repository.js";
import { CreateOrUpdateAuditConfig } from "@/types/master/auditConfig.js";

import { validIdCheck } from "@/validations/global.validation.js";
import { createOrUpdateAuditConfigServiceValidation } from "@/validations/service/master/auditConfig.service.validation.js";
import { AccAuditConfig } from "@repo/db/generated/prisma/client";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";

const cacheKey = getRedisKey("AUDIT_CONFIG", "all");

const auditConfigServiceRaw = {
  async createAuditConfig(
    input: CreateOrUpdateAuditConfig,
  ): Promise<AccAuditConfig> {
    logger.info("entering::createAuditConfig::service");
    await createOrUpdateAuditConfigServiceValidation(input);

    const isCacheable = await checkIsCacheable(SHORT_CODE.AUDIT_CONFIG);
    const auditConfig = await CreateOrUpdateAuditConfigInDb(input);
    if (isCacheable && auditConfig) {
      await addToCache(cacheKey, auditConfig.id, auditConfig);
    }

    logger.info("exiting::createAuditConfig::service");
    return auditConfig;
  },

  async updateAuditConfig(
    input: CreateOrUpdateAuditConfig,
  ): Promise<AccAuditConfig> {
    logger.info("entering::updateAuditConfig::service");
    await createOrUpdateAuditConfigServiceValidation(input);

    const updatedAuditConfig = await updateAuditConfigInDb(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.AUDIT_CONFIG);

    if (isCacheable && updatedAuditConfig) {
      await updateCache(cacheKey, updatedAuditConfig.id, updatedAuditConfig);
    }

    logger.info("exiting::updateAuditConfig::service");
    return updatedAuditConfig;
  },

  async getAuditConfigById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<AccAuditConfig | null> {
    logger.info("entering::getAuditConfigById::service");
    validIdCheck(id);

    const isCacheable = await checkIsCacheable(SHORT_CODE.AUDIT_CONFIG);

    let auditConfig: AccAuditConfig | null;

    if (isCacheable) {
      auditConfig = (await getCacheById(cacheKey, id)) as AccAuditConfig | null;
    } else {
      auditConfig = await getAuditConfigByIdFromDb(id);
    }

    if (!auditConfig) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "AuditConfig"),
        );
    }

    logger.info("exiting::getAuditConfigById::service");
    return auditConfig;
  },

  async getAllAuditConfig(): Promise<AccAuditConfig[]> {
    logger.info("entering::getAllAuditConfig::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.AUDIT_CONFIG);

    let auditConfigs: AccAuditConfig[] = [];

    if (isCacheable) {
      auditConfigs = (await getAllCache(cacheKey)) as AccAuditConfig[];
    } else {
      auditConfigs = await getAllAuditConfigFromDb();
    }

    logger.info("exiting::getAllAuditConfig::service");
    return auditConfigs;
  },
};

export const auditConfigService = auditProxy.createAuditedService(
  "auditConfig",
  auditConfigServiceRaw,
);
