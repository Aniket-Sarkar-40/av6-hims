import {
  markCronFailed,
  markCronInProgress,
  markCronSuccess,
  updateCronMessageById,
} from "@/repository/cron/cronDetails.repository.js";
import type {
  CronDetailsCtx,
  CronDetailsInput,
  CronDetailsSkipReason,
  StartCronDetailsResult,
} from "@/types/cron/cronDetails.js";
import { beginCronDetailsServiceValidation } from "@/validations/service/cron/cronDetails.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";
import { CRON_MAX_RETRIES } from "@repo/shared";
import { withAttemptPrefix } from "@repo/shared/utils/cron.utils.js";
import { getNormalizedParams } from "@repo/shared/utils/helper.utils.js";

export const cronDetailsService = {
  async start(input: CronDetailsInput): Promise<StartCronDetailsResult> {
    logger.info("entering::start::cronDetailsService");

    const validation = await beginCronDetailsServiceValidation(input);

    if (!validation.shouldRun) {
      logger.info("exiting::start::cronDetailsService::skip", {
        reason: validation.reason,
      });
      return { skip: true, reason: validation.reason };
    }

    const ctx = await markCronInProgress({
      ...input,
      attempt: validation.attempt,
    });

    await updateCronMessageById(
      ctx.id,
      withAttemptPrefix(validation.attempt, CRON_MAX_RETRIES, "in_progress"),
    );

    logger.info("exiting::start::cronDetailsService::run", {
      attempt: validation.attempt,
      runKey: input.runKey,
    });
    return { skip: false, ctx };
  },

  async success(input: { ctx: CronDetailsCtx; message?: string }) {
    logger.info("entering::success::cronDetailsService");
    await markCronSuccess(input.ctx, input.message);
    logger.info("exiting::success::cronDetailsService");
  },

  async fail(input: { ctx: CronDetailsCtx; err: unknown }) {
    logger.info("entering::fail::cronDetailsService");
    await markCronFailed(input.ctx, input.err);
    logger.info("exiting::fail::cronDetailsService");
  },
};

export type RunCronTaskOptions<T> = {
  cronName: string;
  runKey: string;
  runDate?: Date;
  /** The actual unit of work. Receives the started cron context (attempt, id, etc.). */
  task: (ctx: CronDetailsCtx) => Promise<T>;
  /** Optional formatter to build the success message from the task result. */
  buildMessage?: (result: T) => string | undefined;
};

export type CronTaskOutcome<T> =
  | {
      status: "SKIPPED";
      reason: CronDetailsSkipReason;
      cronName: string;
      runDateIso: string;
      runKey: string;
    }
  | {
      status: "SUCCESS";
      ctx: CronDetailsCtx;
      result: T;
      cronName: string;
      runDateIso: string;
      runKey: string;
    }
  | {
      status: "FAILED";
      ctx: CronDetailsCtx;
      err: unknown;
      cronName: string;
      runDateIso: string;
      runKey: string;
    };

/**
 * Generic cron orchestrator. Wraps a task with `cronDetailsService.start` /
 * `cronDetailsService.success` / `cronDetailsService.fail` only. Retry / clear-retry
 * decisions are intentionally left to the caller via the returned outcome.
 */
export const runCronTask = async <T>(
  options: RunCronTaskOptions<T>,
): Promise<CronTaskOutcome<T>> => {
  const { cronName, runKey, task, buildMessage } = options;
  const runDate = options.runDate ?? new Date();

  const { runDate: normRunDate } = getNormalizedParams(cronName, runDate);
  const runDateIso = normRunDate.toISOString().slice(0, 10);

  logger.info(`cron::${cronName}::start`, { runDateIso, runKey });

  const input: CronDetailsInput = { cronName, runDate, runKey };
  const started = await cronDetailsService.start(input);

  if (started.skip) {
    logger.info(`cron::${cronName}::skip`, {
      reason: started.reason,
      runDateIso,
      runKey,
    });
    return {
      status: "SKIPPED",
      reason: started.reason,
      cronName,
      runDateIso,
      runKey,
    };
  }

  const ctx = started.ctx;
  const attempt = ctx.attempt;

  try {
    const result = await task(ctx);

    await cronDetailsService.success({
      ctx,
      message: withAttemptPrefix(
        attempt,
        CRON_MAX_RETRIES,
        buildMessage?.(result),
      ),
    });

    logger.info(`cron::${cronName}::done`, { runDateIso, runKey, attempt });
    return { status: "SUCCESS", ctx, result, cronName, runDateIso, runKey };
  } catch (err) {
    await cronDetailsService.fail({
      ctx,
      err: new Error(
        withAttemptPrefix(
          attempt,
          CRON_MAX_RETRIES,
          err instanceof Error ? err.message : String(err),
        ),
      ),
    });

    logger.error(`cron::${cronName}::failed`, {
      runDateIso,
      runKey,
      attempt,
      err,
    });
    return { status: "FAILED", ctx, err, cronName, runDateIso, runKey };
  }
};

// use case example
// const outcome = await runCronTask({
//   cronName: "batchSyncInteraktLeads",
//   runKey: someRunKey,
//   runDate: new Date(),
//   task: async () => batchSyncInteraktLeadsService(),
//   buildMessage: (r) =>
//     [
//       `insertedCount=${r.insertedCount}`,
//       `skippedInvalidCount=${r.skippedInvalidCount}`,
//       `totalProcessedCustomers=${r.totalProcessedCustomers}`,
//       `syncedTill=${r.syncedTill}`,
//     ].join(", "),
// });

// if (outcome.status === "SKIPPED") {
//   if (outcome.reason === "ALREADY_SUCCESS_FOR_RUNKEY" || outcome.reason === "RETRY_EXHAUSTED") {
//     clearCronRetry({ cronName: outcome.cronName, runDateIso: outcome.runDateIso, runKey: outcome.runKey });
//   }
//   return;
// }

// if (outcome.status === "SUCCESS") {
//   clearCronRetry({ cronName: outcome.cronName, runDateIso: outcome.runDateIso, runKey: outcome.runKey });
//   return;
// }

// if (outcome.ctx.attempt < CRON_MAX_RETRIES) {
//   scheduleCronRetryOnce({
//     cronName: outcome.cronName,
//     runDateIso: outcome.runDateIso,
//     runKey: outcome.runKey,
//     fire: async () => /* re-fire wrapper */,
//   });
// }
