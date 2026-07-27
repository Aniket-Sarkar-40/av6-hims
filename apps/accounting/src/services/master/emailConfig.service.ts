import { upsertEmailConfigByTypeInDb } from "@/repository/master/emailConfig.repository.js";
import { CreateOrUpdateEmailConfig } from "@/types/master/emailConfig.js";
import { createOrUpdateEmailConfigServiceValidation } from "@/validations/service/master/emailConfig.service.validation.js";
import { auditProxy } from "@/config/audit.config.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { AccEmailConfig } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";
import { addToCache } from "@repo/platform/cache/redis.utils.js";

const cacheKey = getRedisKey("EMAIL_CONFIG", "all");

const emailConfigServiceRaw = {
  async upsertEmailConfig(
    input: CreateOrUpdateEmailConfig,
  ): Promise<AccEmailConfig> {
    logger.info("entering::upsertEmailConfig::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.EMAIL_CONFIG);

    await createOrUpdateEmailConfigServiceValidation(input);

    const created = await upsertEmailConfigByTypeInDb(input);

    if (isCacheable) {
      await addToCache(cacheKey, created.id, created);
    }

    logger.info("exiting::upsertEmailConfig::service");
    return created;
  },
};

export const emailConfigService = auditProxy.createAuditedService(
  "emailConfig",
  emailConfigServiceRaw,
);
