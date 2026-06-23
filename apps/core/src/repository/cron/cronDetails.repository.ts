import type {
  CronDetailsCtx,
  CronDetailsInput,
} from "@/types/cron/cronDetails.js";
import { db } from "@repo/db/client";
import { CronStatus } from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  calcDurationMs,
  errToMessage,
  getNormalizedParams,
} from "@repo/shared/utils/helper.utils.js";

const normRunKey = (runKey: string) => runKey.trim();

export const getLatestCronByRunKey = async (input: CronDetailsInput) => {
  logger.info("repo::cronDetails::getLatestCronByRunKey");

  const { name, runDate: normDate } = getNormalizedParams(
    input.cronName,
    input.runDate
  );
  const rk = normRunKey(input.runKey);

  return db.cronDetails.findFirst({
    where: { cronName: name, runDate: normDate, runKey: rk },
    orderBy: [{ attempt: "desc" }],
    select: {
      id: true,
      status: true,
      startedAt: true,
      attempt: true,
      message: true,
    },
  });
};

export const markCronInProgress = async (
  input: CronDetailsInput & { attempt: number; message?: string }
): Promise<CronDetailsCtx> => {
  logger.info("repo::cronDetails::markCronInProgress");

  const { name, runDate: normDate } = getNormalizedParams(
    input.cronName,
    input.runDate
  );
  const rk = normRunKey(input.runKey);
  const startedAt = new Date();

  const row = await db.cronDetails.upsert({
    where: {
      cron_unique_runkey_attempt: {
        cronName: name,
        runDate: normDate,
        runKey: rk,
        attempt: input.attempt,
      },
    },
    create: {
      cronName: name,
      runDate: normDate,
      runKey: rk,
      attempt: input.attempt,
      status: CronStatus.IN_PROGRESS,
      startedAt,
      message: input.message ?? null,
    },
    update: {
      status: CronStatus.IN_PROGRESS,
      startedAt,
      endedAt: null,
      durationMs: null,
      ...(input.message ? { message: input.message } : {}),
    },
    select: { id: true },
  });

  return {
    id: row.id,
    cronName: name,
    runDate: normDate,
    startedAt,
    runKey: rk,
    attempt: input.attempt,
  };
};

export const updateCronMessageById = async (id: number, message: string) => {
  logger.info("repo::cronDetails::updateCronMessageById");
  return db.cronDetails.update({ where: { id }, data: { message } });
};

export const markCronSuccess = async (
  ctx: CronDetailsCtx,
  message?: string
) => {
  logger.info("repo::cronDetails::markCronSuccess");

  const endedAt = new Date();
  const durationMs = calcDurationMs(ctx.startedAt, endedAt);

  return db.cronDetails.update({
    where: { id: ctx.id },
    data: {
      status: CronStatus.SUCCESS,
      endedAt,
      durationMs,
      message: message?.trim() ? message : "success",
    },
  });
};

export const markCronFailed = async (ctx: CronDetailsCtx, err: unknown) => {
  logger.info("repo::cronDetails::markCronFailed");

  const endedAt = new Date();
  const durationMs = calcDurationMs(ctx.startedAt, endedAt);

  return db.cronDetails.update({
    where: { id: ctx.id },
    data: {
      status: CronStatus.FAILED,
      endedAt,
      durationMs,
      message: errToMessage(err),
    },
  });
};

export const markCronFailedById = async (id: number, message: string) => {
  logger.info("repo::cronDetails::markCronFailedById");

  const endedAt = new Date();

  return db.cronDetails.update({
    where: { id },
    data: {
      status: CronStatus.FAILED,
      endedAt,
      durationMs: 0,
      message: message?.trim() ? message : "failed",
    },
  });
};

export const getCronDetailsById = async (id: number) => {
  logger.info("repo::cronDetails::getCronDetailsById");

  return db.cronDetails.findFirst({
    where: {
      id,
    },
  });
};
