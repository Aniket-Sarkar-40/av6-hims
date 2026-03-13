import { auditProxy } from "@/config/audit.config.js";
import {
  deleteAllEmailConfigsInDb,
  createEmailConfigInDb,
  getEmailConfigFromDb,
  deleteEmailConfigInDb,
} from "@/repository/master/emailConfig.repository.js";
import { CreateOrUpdateEmailConfig } from "@/types/master/emailConfig.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import {
  getAllCache,
  deleteCache,
  addToCache,
} from "@repo/platform/cache/redis.utils.js";
import { getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/core.shortCode.utils.js";
import { EmailConfig } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { checkIsCacheable } from "@/config/cache.config.js";

const cacheKey = getRedisKey("EMAIL_CONFIG", "all");

const emailConfigServiceRaw = {
  async upsertEmailConfig(
    input: CreateOrUpdateEmailConfig
  ): Promise<EmailConfig> {
    logger.info("entering::upsertEmailConfig::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.EMAIL_CONFIG);

    if (isCacheable) {
      const cached = (await getAllCache(cacheKey)) as EmailConfig[] | null;
      if (Array.isArray(cached)) {
        for (const cfg of cached) {
          await deleteCache(cacheKey, cfg.id);
        }
      }
    }

    await deleteAllEmailConfigsInDb();

    const created = await createEmailConfigInDb(input);

    if (isCacheable) {
      await addToCache(cacheKey, created.id, created);
    }

    logger.info("exiting::upsertEmailConfig::service");
    return created;
  },
  async getEmailConfig(): Promise<EmailConfig> {
    logger.info("entering::getEmailConfig::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.EMAIL_CONFIG);

    if (isCacheable) {
      const cached = (await getAllCache(cacheKey)) as EmailConfig[] | null;
      if (Array.isArray(cached) && cached.length > 0 && cached[0]) {
        logger.info("exiting::getEmailConfig::service (cache)");
        return cached[0];
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Email Configs")
        );
      }
    }

    const config = await getEmailConfigFromDb();
    if (!config) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Email Configs")
      );
    }

    logger.info("exiting::getEmailConfig::service (db)");
    return config;
  },

  async deleteEmailConfig(): Promise<{ message: string }> {
    logger.info("entering::deleteEmailConfig::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.EMAIL_CONFIG);

    const configs = await getEmailConfigFromDb();
    if (!configs) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Email Config")
      );
    }

    const id = configs.id;
    await deleteEmailConfigInDb(id);

    if (isCacheable) {
      await deleteCache(cacheKey, id);
    }

    logger.info("exiting::deleteEmailConfig::service");
    return { message: "Email Config deleted successfully" };
  },
};

export const emailConfigService = auditProxy.createAuditedService(
  "emailConfig",
  emailConfigServiceRaw
);
