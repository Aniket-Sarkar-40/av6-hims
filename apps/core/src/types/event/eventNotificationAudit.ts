import { EventDelivery, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";

export interface EventNotificationAuditDTO extends EventDelivery {
  eventConfig: IdValue | null;
}

export type NotificationInput = Prisma.NotificationGetPayload<{
  include: {
    user: true;
    level1: true;
  };
}>;

export interface NotificationDTO
  extends Omit<NotificationInput, "user" | "level1"> {
  level1: IdValue | null;
  user: IdValue | null;
}
