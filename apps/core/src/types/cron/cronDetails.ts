import { CronDetails } from "@repo/db/generated/prisma/client";

export type CronRunKey = string;

export type CronDetailsInput = Pick<CronDetails, "cronName" | "runDate"> & {
  runKey: CronRunKey;
};

export type CronDetailsCtx = Pick<
  CronDetails,
  "id" | "cronName" | "runDate" | "startedAt"
> & {
  runKey: CronRunKey;
  attempt: number;
};

export type CronDetailsSkipReason =
  | "ALREADY_IN_PROGRESS"
  | "ALREADY_SUCCESS_FOR_RUNKEY"
  | "RETRY_EXHAUSTED";

export type CronDetailsShouldRunResult =
  | { shouldRun: true; attempt: number }
  | { shouldRun: false; reason: CronDetailsSkipReason };

export type StartCronDetailsResult =
  | { skip: true; reason: CronDetailsSkipReason }
  | { skip: false; ctx: CronDetailsCtx };
