import { cronService } from "@/services/cron/cron.service.js";
import { runCronTask } from "@apps/core/services/cron/cronDetails.service.js";
import { ALERT_MODE } from "@repo/db/generated/prisma/enums.js";
import cron from "node-cron";

export function registerCron() {
  const timezone = "Asia/Kolkata";

  cron.schedule(
    "0 5 * * *",
    async () => {
      const runKey = new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());

      await runCronTask({
        cronName: "reOrderEmail",
        runKey: runKey,
        runDate: new Date(),
        task: async () => {
          await cronService.reOrderAlert({
            alertMode: ALERT_MODE.SYSTEM,
            isResend: false,
          });
        },
        buildMessage: () => "Reorder level cron completed",
      });
    },
    {
      timezone,
    }
  );

  cron.schedule(
    "0 6 * * *",
    async () => {
      const runKey = new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());

      await runCronTask({
        cronName: "expiredEmail",
        runKey: runKey,
        runDate: new Date(),
        task: async () => {
          await cronService.expiredItemAlert({
            alertMode: ALERT_MODE.SYSTEM,
            isResend: false,
          });
        },
        buildMessage: () => "Expired cron completed",
      });
    },
    {
      timezone,
    }
  );

  cron.schedule(
    "0 7 * * *",
    async () => {
      const runKey = new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());

      await runCronTask({
        cronName: "earlyExpiryEmail",
        runKey: runKey,
        runDate: new Date(),
        task: async () => {
          await cronService.expiringItemAlert({
            alertMode: ALERT_MODE.SYSTEM,
            isResend: false,
          });
        },
        buildMessage: () => "Early expiry cron completed",
      });
    },
    {
      timezone,
    }
  );
}
