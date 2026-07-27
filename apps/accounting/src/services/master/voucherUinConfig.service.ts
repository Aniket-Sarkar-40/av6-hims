import { getAll } from "@/repository/common.repository.js";
import {
  checkForNextVoucherUINConfigExists,
  checkOverlapAndFutureVoucherUINConfig,
  createVoucherUINConfigInDb,
  deleteVoucherUINConfigById,
  getVoucherUINConfigByVoucherTypeIdAndDate,
  updateVoucherUINConfig,
  updateVoucherUINConfigSequenceNo,
} from "@/repository/master/voucherUinConfig.repository.js";
import { CreateOrUpdateVoucherUINConfigRequest } from "@/types/master/voucherUinConfig.js";

import {
  createOrUpdateVoucherUINConfigServiceValidation,
  validateIdVoucherUINConfig,
} from "@/validations/service/master/voucherUinConfig.service.validation.js";
import { UIN_RESET_POLICY } from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { UINSegment } from "av6-core-v2";
import dayjs from "dayjs";
import cron from "node-cron";

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

export const voucherUINConfigService = {
  async createVoucherUINConfig(input: CreateOrUpdateVoucherUINConfigRequest) {
    logger.info("entering::createVoucherUINConfig::service");
    await createOrUpdateVoucherUINConfigServiceValidation(input);
    const voucherUINConfig = await createVoucherUINConfigInDb(input);
    logger.info("exiting::createVoucherUINConfig::service");
    return voucherUINConfig;
  },

  async loadConfig(voucherTypeId: number, date: Date) {
    const cfg = await getVoucherUINConfigByVoucherTypeIdAndDate(
      voucherTypeId,
      date,
    );
    if (!cfg)
      throw new ErrorHandler(
        404,
        `Voucher UIN Config not found for voucher type: ${voucherTypeId} and date: ${date}`,
      );

    return cfg;
  },

  async generateUIN(voucherTypeId: number, date: Date): Promise<string> {
    const cfg = await this.loadConfig(voucherTypeId, date);

    // increment
    const curr = BigInt(cfg.sequenceNo.toString());
    const next = curr + BigInt(1);

    // persist to DB
    await updateVoucherUINConfigSequenceNo(cfg.id, next);

    return buildFromSegments(
      typeof cfg.uinSegments === "string"
        ? (JSON.parse(cfg.uinSegments) as UINSegment[])
        : [],
      next,
    );
  },

  async updateVoucherUINConfig(req: CreateOrUpdateVoucherUINConfigRequest) {
    logger.info("entering::updateVoucherUINConfig::service");
    const existingVoucherUINConfig =
      await createOrUpdateVoucherUINConfigServiceValidation(req);

    const updatedVoucherUINConfig = await updateVoucherUINConfig(
      req,
      existingVoucherUINConfig!,
    );

    logger.info("exiting::updateUINConfig::service");
    return updatedVoucherUINConfig;
  },

  async deleteVoucherUINConfig(id: number): Promise<void> {
    logger.info("entering::deleteVoucherUINConfig::service");
    await validateIdVoucherUINConfig(id);

    await deleteVoucherUINConfigById(id);

    logger.info("exiting::deleteVoucherUINConfig::service");
  },
};

// const toDbDate = (date: dayjs.Dayjs | Date): Date => {
//   const d = dayjs(date);

//   return new Date(Date.UTC(d.year(), d.month(), d.date()));
// };

const getNextResetDate = (date: Date, policy: UIN_RESET_POLICY) => {
  const baseDate = dayjs(date).startOf("day");

  switch (policy) {
    case UIN_RESET_POLICY.daily:
      return baseDate.add(1, "day").format("YYYY-MM-DD");

    case UIN_RESET_POLICY.weekly:
      return baseDate.add(1, "week").format("YYYY-MM-DD");

    case UIN_RESET_POLICY.monthly:
      return baseDate.add(1, "month").format("YYYY-MM-DD");

    case UIN_RESET_POLICY.yearly:
      return baseDate.add(1, "year").format("YYYY-MM-DD");

    case UIN_RESET_POLICY.no:
    default:
      return null;
  }
};
/**
 * Daily reset job at 00:02.
 * Fetches *all* configs from DB, applies reset rules,
 * writes back both to DB and Redis (if cacheable).
 */
// "*/2 * * * *" = every 2 minutes
// 01 0 * * *
cron.schedule("01 0 * * *", async () => {
  const today = dayjs().startOf("day");

  const all = await getAll<"VoucherUINConfig">({
    model: "VoucherUINConfig",
    useActiveFlag: true,
  });

  for (const cfg of all) {
    try {
      if (!cfg.seqResetDate) continue;
      if (cfg.seqResetPolicy === UIN_RESET_POLICY.no) continue;

      const shouldResetToday = dayjs(cfg.seqResetDate)
        .startOf("day")
        .isSame(today, "day");

      if (!shouldResetToday) continue;

      const effectiveConfig = await checkForNextVoucherUINConfigExists(
        cfg.id,
        cfg.voucherTypeId,
        new Date(today.format("YYYY-MM-DD")),
      );

      /**
       * If another config is currently effective,
       * skip reset for this old config.
       */
      if (effectiveConfig.length) {
        logger.info(
          `Skipping UIN reset for config ${cfg.id}, voucher type ${cfg.voucherTypeId}. Another config is effective.`,
        );
        continue;
      }

      let currentConfigResetDate: string | null = null;
      currentConfigResetDate = getNextResetDate(
        today.toDate(),
        cfg.seqResetPolicy,
      );

      if (!currentConfigResetDate) continue;

      const overlapConfig = await checkOverlapAndFutureVoucherUINConfig(
        cfg.id,
        cfg.voucherTypeId,
        cfg.seqStartDate,
        new Date(currentConfigResetDate),
      );
      if (overlapConfig.length > 0) {
        const overlapOrNextConfigStartDate = overlapConfig[0].seqStartDate;

        if (
          dayjs(overlapOrNextConfigStartDate).isBefore(
            dayjs(currentConfigResetDate),
          )
        ) {
          currentConfigResetDate = dayjs(overlapOrNextConfigStartDate).format(
            "YYYY-MM-DD",
          );
        }
      }
      // new logic to create  a new config instead of updating the existing config
      const newConfig: CreateOrUpdateVoucherUINConfigRequest = {
        voucherTypeId: cfg.voucherTypeId,
        seqStartDate: cfg.seqResetDate,
        seqResetDate: new Date(currentConfigResetDate),
        seqResetPolicy: cfg.seqResetPolicy,
        description: cfg.description,
        uinSegments:
          typeof cfg.uinSegments === "string"
            ? (JSON.parse(cfg.uinSegments) as UINSegment[])
            : [],
      };

      await createVoucherUINConfigInDb(newConfig);
    } catch (error) {
      logger.error(
        `Failed to reset sequence for voucher type ${cfg.voucherTypeId} & id ${cfg.id}:`,
        error,
      );
    }
  }
});
