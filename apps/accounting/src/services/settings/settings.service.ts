import { auditProxy } from "@/config/audit.config.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { toSettingsDto } from "@/mapper/master/settings.mapper.js";
import {
  getAllSettingsFromDb,
  getSettingFromDb,
  getSettingsByIdFromDb,
  upsertSettingsInDb,
} from "@/repository/settings/settings.repository.js";
import { CreateOrUpdateSettings } from "@/types/settings/settings.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateUpsertSettingsServiceValidation } from "@/validations/service/settings/settings.service.validation.js";
import { AccSettings } from "@repo/db/generated/prisma/client";
import {
  addToCache,
  getAllCache,
  getCacheById,
} from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";

const cacheKey = getRedisKey("SETTINGS", "all");

const settingsServiceRaw = {
  async upsertSettings(input: CreateOrUpdateSettings): Promise<SettingsDTO> {
    logger.info("entering::upsertSettings::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.SETTINGS);
    await validateUpsertSettingsServiceValidation(input);
    const setting = await upsertSettingsInDb(input);
    if (isCacheable && setting) {
      await addToCache(cacheKey, setting.id, setting);
    }

    logger.info("exiting::upsertSettings::service");
    return await toSettingsDto(setting);
  },

  async getSettingsById(
    id: number,
    canNullReturnable: boolean = false
  ): Promise<SettingsDTO | null> {
    logger.info("entering::getSettingsById::service");

    validIdCheck(id);

    const isCacheable = await checkIsCacheable(SHORT_CODE.SETTINGS);

    let setting: AccSettings | null;

    if (isCacheable) {
      setting = (await getCacheById(cacheKey, id)) as AccSettings | null;
    } else {
      setting = await getSettingsByIdFromDb(id);
    }

    if (!setting) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Settings")
        );
    }

    logger.info("exiting::getSettingsById::service");

    return setting ? await toSettingsDto(setting) : null;
  },

  async getAllSettings(): Promise<AccSettingsDTO[]> {
    logger.info("entering::getAllSettings::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.SETTINGS);

    let settings: AccSettings[] = [];

    if (isCacheable) {
      settings = (await getAllCache(cacheKey)) as Settings[];
    } else {
      settings = await getAllSettingsFromDb();
    }

    logger.info("exiting::getAllSettings::service");
    return Promise.all(settings.map(async (s) => await toSettingsDto(s)));
  },

  async getSettings(): Promise<SettingsDTO | null> {
    logger.info("entering::getSettings::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.SETTINGS);
    let settings: AccSettings | null = null;
    if (isCacheable) {
      const cached = (await getAllCache(cacheKey)) as AccSettings[] | null;
      if (cached && cached.length > 0) {
        logger.info("exiting::getSettings::service (cache)");
        settings = cached[0];
        return await toSettingsDto(settings);
      }
    }

    settings = await getSettingFromDb();

    logger.info("exiting::getSettings::service");
    return settings ? await toSettingsDto(settings) : null;
  },
};

export const settingsService = auditProxy.createAuditedService(
  "settings",
  settingsServiceRaw
);
