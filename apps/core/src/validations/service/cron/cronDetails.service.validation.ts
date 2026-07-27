import {
  getCronDetailsById,
  getLatestCronByRunKey,
  markCronFailedById,
} from "@/repository/cron/cronDetails.repository.js";
import type {
  CronDetailsInput,
  CronDetailsShouldRunResult,
} from "@/types/cron/cronDetails.js";
import { CronStatus } from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";
import { CRON_IN_PROGRESS_STALE_MS, CRON_MAX_RETRIES } from "@repo/shared";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdCronDetails = async (id: number) => {
  logger.info("entering::validateIdCronDetails::serviceValidation");

  const cron = await getCronDetailsById(id);

  if (!cron) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Cron Details"),
    );
  }
  logger.info("exiting::validateIdCronDetails::serviceValidation");
  return cron;
};

export const beginCronDetailsServiceValidation = async (
  input: CronDetailsInput,
): Promise<CronDetailsShouldRunResult> => {
  logger.info("entering::beginCronDetailsServiceValidation::serviceValidation");

  const latest = await getLatestCronByRunKey(input);

  if (!latest) {
    return { shouldRun: true, attempt: 1 };
  }

  if (latest.status === CronStatus.SUCCESS) {
    return { shouldRun: false, reason: "ALREADY_SUCCESS_FOR_RUNKEY" };
  }

  if (latest.status === CronStatus.IN_PROGRESS) {
    const startedAtMs = latest.startedAt
      ? new Date(latest.startedAt).getTime()
      : 0;
    const ageMs = startedAtMs
      ? Date.now() - startedAtMs
      : Number.POSITIVE_INFINITY;

    if (startedAtMs && ageMs <= CRON_IN_PROGRESS_STALE_MS) {
      return { shouldRun: false, reason: "ALREADY_IN_PROGRESS" };
    }

    await markCronFailedById(
      latest.id,
      `stale in-progress takeover (ageMs=${ageMs})`,
    );
  }

  const nextAttempt = (latest.attempt ?? 0) + 1;

  if (nextAttempt > CRON_MAX_RETRIES) {
    return { shouldRun: false, reason: "RETRY_EXHAUSTED" };
  }

  return { shouldRun: true, attempt: nextAttempt };
};
