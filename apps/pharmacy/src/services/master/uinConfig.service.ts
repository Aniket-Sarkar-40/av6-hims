import { toUINConfigDTO } from "@/mapper/master/uinConfig.mapper.js";
import {
  createUINConfigInDb,
  deleteUINConfigById,
  getAllUINConfigFromDb,
  getUINConfigByShortCodeFromDb,
  updateSequenceNo,
  updateSequenceNoAndResetDate,
  updateUINConfig,
} from "@/repository/master/uinConfig.repository.js";
import {
  CreateUINConfigRequest,
  UINConfigDTO,
  UINPreviewRequest,
  UINSegment,
  UpdateUINConfigRequest,
} from "@/types/master/uinConfig.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  deleteCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import {
  createUinConfigServiceValidation,
  updateIdUinConfigServiceValidation,
  validateIdUinConfig,
} from "@/validations/service/master/uinConfig.service.validation.js";
import {
  UIN_RESET_POLICY,
  PmsUINConfig,
  PmsUinShortCode,
} from "@repo/db/generated/prisma/client";
import dayjs from "dayjs";

const cacheKey = getRedisKey("UIN_CONFIG", "all");
const MS_IN_A_DAY = 24 * 3600e3;

function buildFromSegments(segments: UINSegment[], seqValue: bigint): string {
  segments.sort((a, b) => a.order - b.order);
  let out = "";

  for (const seg of segments) {
    switch (seg.type) {
      case "text":
      case "separator":
        out += seg.value ?? "";
        break;

      case "dateFormat":
        try {
          out += dayjs(new Date()).format(seg.value);
        } catch {
          console.error("Invalid dateFormat:", seg.value);
        }
        break;

      case "sequenceNo": {
        const len = seg.minSeqLength ?? 0;
        out += seqValue.toString().padStart(len, "0");
        break;
      }
    }
  }

  return out;
}

export const uinConfigService = {
  async createUINConfig(input: CreateUINConfigRequest) {
    logger.info("entering::createUINConfig::service");
    await createUinConfigServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.UIN_CONFIG);

    const uinConfig = await createUINConfigInDb(input);
    if (isCacheable && uinConfig) {
      await addToCache(cacheKey, uinConfig.shortCode, uinConfig);
    }
    const uinConfigDTO = toUINConfigDTO(uinConfig);
    logger.info("exiting::createStore::service");
    return uinConfigDTO;
  },

  async loadConfig(shortCode: PmsUinShortCode) {
    const useCache = await checkIsCacheable(SHORT_CODE.UIN_CONFIG);
    if (useCache) {
      const cached = (await getCacheById(cacheKey, shortCode)) as PmsUINConfig;
      if (cached) return cached;
    }

    const cfg = await getUINConfigByShortCodeFromDb(shortCode);
    if (!cfg) throw new ErrorHandler(404, `Invalid shortCode: ${shortCode}`);

    if (useCache) {
      await addToCache(cacheKey, shortCode, cfg);
    }
    return cfg;
  },

  async generateUIN(shortCode: PmsUinShortCode): Promise<string> {
    const cfg = await this.loadConfig(shortCode);

    // increment
    const curr = BigInt(cfg.sequenceNo.toString());
    const next = curr + BigInt(1);

    // persist to DB
    await updateSequenceNo(shortCode, next);

    // update Redis cache if used
    if (await checkIsCacheable(SHORT_CODE.UIN_CONFIG)) {
      cfg.sequenceNo = next;
      await updateCache(cacheKey, shortCode, cfg);
    }

    return buildFromSegments(
      typeof cfg.uinSegments === "string"
        ? (JSON.parse(cfg.uinSegments) as UINSegment[])
        : [],
      next,
    );
  },

  async previewConfig(shortCode: PmsUinShortCode): Promise<string> {
    const cfg = await this.loadConfig(shortCode);
    return buildFromSegments(
      typeof cfg.uinSegments === "string"
        ? (JSON.parse(cfg.uinSegments) as UINSegment[])
        : [],
      BigInt(1),
    );
  },

  previewCustom(body: UINPreviewRequest): string {
    return buildFromSegments(body.uinSegments, BigInt(1));
  },

  async updateUINConfig(req: UpdateUINConfigRequest): Promise<UINConfigDTO> {
    logger.info("entering::updateUINConfig::service");
    const existingUin = await updateIdUinConfigServiceValidation(req);

    const isCacheable = await checkIsCacheable(SHORT_CODE.UIN_CONFIG);

    const updatedUin = await updateUINConfig(req, existingUin);
    if (isCacheable && updatedUin) {
      await updateCache(cacheKey, updatedUin.shortCode, updatedUin);
    }

    logger.info("exiting::updateUINConfig::service");
    return toUINConfigDTO(updatedUin);
  },

  async deleteUINConfig(id: number): Promise<void> {
    logger.info("entering::deleteUINConfig::service");
    const existing = await validateIdUinConfig(id);

    await deleteUINConfigById(id);

    // Update cache if applicable
    if (await checkIsCacheable(SHORT_CODE.UIN_CONFIG)) {
      await deleteCache(cacheKey, existing.shortCode);
    }

    logger.info("exiting::deleteUINConfig::service");
  },

  async getAllEnumCodes(): Promise<string[]> {
    logger.info("entering::getAllEnumCodes::service");

    const prismaArray = Object.values(PmsUinShortCode);

    logger.info("exiting::getAllEnumCodes::service (cache rebuilt)");
    return prismaArray;
  },
};
/**
 * Daily reset job at 00:01.
 * Fetches *all* configs from DB, applies reset rules,
 * writes back both to DB and Redis (if cacheable).
 */
cron.schedule("01 0 * * *", async () => {
  const now = new Date();
  const all = await getAllUINConfigFromDb();

  for (const cfg of all) {
    const ageMs = cfg.seqResetDate
      ? now.getTime() - cfg.seqResetDate.getTime()
      : 0;
    let shouldReset = false;

    switch (cfg.seqResetPolicy) {
      case UIN_RESET_POLICY.daily:
        shouldReset = ageMs >= MS_IN_A_DAY;
        break;
      case UIN_RESET_POLICY.weekly:
        shouldReset = ageMs >= 7 * MS_IN_A_DAY;
        break;
      case UIN_RESET_POLICY.monthly:
        shouldReset = ageMs >= 30 * MS_IN_A_DAY;
        break;
      case UIN_RESET_POLICY.yearly:
        shouldReset = ageMs >= 365 * MS_IN_A_DAY;
        break;
    }

    if (!shouldReset) continue;
    try {
      await updateSequenceNoAndResetDate(cfg.shortCode, BigInt(0), now);
    } catch (error) {
      logger.error(
        `Failed to reset sequence for shortCode ${cfg.shortCode}:`,
        error,
      );
      // Optionally retry the operation
      try {
        await updateSequenceNoAndResetDate(cfg.shortCode, BigInt(0), now);
      } catch (retryError) {
        logger.error(
          `Retry failed for shortCode ${cfg.shortCode}:`,
          retryError,
        );
      }
    }

    if (await checkIsCacheable(SHORT_CODE.UIN_CONFIG)) {
      cfg.sequenceNo = BigInt(0);
      cfg.seqResetDate = now;
      await updateCache(cacheKey, cfg.shortCode, cfg);
    }
  }
});
