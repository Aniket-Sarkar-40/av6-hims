import {
  getEmailConfigFromDb,
  getEventEmailFromDb,
} from "@/repository/master/emailConfig.repository.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { getAllCache } from "@repo/platform/cache/redis.utils.js";
import { getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/inventory.shortCode.utils.js";
import { EmailConfig, EventEmail } from "@repo/db/generated/prisma/client";
import { checkIsCacheable } from "@/config/cache.config.js";

const cacheKey = getRedisKey("EVENT_EMAIL", "all");

export const eventEmailService = {
  async getEventEmail(): Promise<EventEmail | null> {
    logger.info("entering::getEventEmail::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.EVENT_EMAIL);

    if (isCacheable) {
      const cached = (await getAllCache(cacheKey)) as EventEmail[] | null;
      if (cached && cached.length > 0) {
        logger.info("exiting::getEventEmail::service (cache)");
        return cached[0];
      } else {
        return null;
      }
    }

    const config = await getEventEmailFromDb();

    logger.info("exiting::getEventEmail::service (db)");
    return config;
  },

  async getEmailConfig(): Promise<EmailConfig> {
    logger.info("entering::getEmailConfig::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.EMAIL_CONFIG);

    if (isCacheable) {
      const cached = (await getAllCache(cacheKey)) as EmailConfig[] | null;
      if (cached && cached.length > 0) {
        logger.info("exiting::getEmailConfig::service (cache)");
        return cached[0];
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Email Configs"),
        );
      }
    }

    const config = await getEmailConfigFromDb();
    if (!config) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Email Configs"),
      );
    }

    logger.info("exiting::getEmailConfig::service (db)");
    return config;
  },
};
