import { CRON_RETRY_DELAY_MS } from "@repo/shared/config/index.js";

export const parseAttemptFromMessage = (
  msg: string | null | undefined,
): number => {
  if (!msg) return 0;
  const m = msg.match(/attempt=(\d+)\//);
  return m ? Number(m[1]) : 0;
};

export const withAttemptPrefix = (
  attempt: number,
  max: number,
  msg?: string,
): string => {
  const safe = msg?.trim();
  return `attempt=${attempt}/${max}${safe ? ` | ${safe}` : ""}`;
};

const retryTimers = new Map<string, NodeJS.Timeout>();

export const scheduleCronRetryOnce = (params: {
  cronName: string;
  runDateIso: string;
  runKey: string;
  fire: () => Promise<void>;
}) => {
  const key = `${params.cronName}|${params.runDateIso}|${params.runKey}`;
  if (retryTimers.has(key)) return;

  const t = setTimeout(async () => {
    retryTimers.delete(key);
    await params.fire();
  }, CRON_RETRY_DELAY_MS);

  retryTimers.set(key, t);
};

export const clearCronRetry = (params: {
  cronName: string;
  runDateIso: string;
  runKey: string;
}) => {
  const key = `${params.cronName}|${params.runDateIso}|${params.runKey}`;
  const t = retryTimers.get(key);
  if (t) clearTimeout(t);
  retryTimers.delete(key);
};

export function buildCronMessage(input: {
  created: number;
  skipped: number;
  skippedVendorIds: number[];
  skipReasons?: Record<string, number[]>;
}) {
  return JSON.stringify({
    created: input.created,
    skipped: input.skipped,
    skippedVendorIds: input.skippedVendorIds,
    skipReasons: input.skipReasons ?? {},
  });
}
