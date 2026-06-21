import type { CronDetailsCtx, CronDetailsInput, CronDetailsSkipReason, StartCronDetailsResult } from "@/types/cron/cronDetails.js";
export declare const cronDetailsService: {
    start(input: CronDetailsInput): Promise<StartCronDetailsResult>;
    success(input: {
        ctx: CronDetailsCtx;
        message?: string;
    }): Promise<void>;
    fail(input: {
        ctx: CronDetailsCtx;
        err: unknown;
    }): Promise<void>;
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
export type CronTaskOutcome<T> = {
    status: "SKIPPED";
    reason: CronDetailsSkipReason;
    cronName: string;
    runDateIso: string;
    runKey: string;
} | {
    status: "SUCCESS";
    ctx: CronDetailsCtx;
    result: T;
    cronName: string;
    runDateIso: string;
    runKey: string;
} | {
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
export declare const runCronTask: <T>(options: RunCronTaskOptions<T>) => Promise<CronTaskOutcome<T>>;
//# sourceMappingURL=cronDetails.service.d.ts.map