import { eventConfigService } from "@/services/event/eventConfig.service.js";
import {
  EventNotificationAuditDTO,
  NotificationDTO,
  NotificationInput,
} from "@/types/event/eventNotificationAudit.js";
import { toIdValue } from "av6-utils";
import { EventDelivery } from "@repo/db/generated/prisma/client";

export const toEventNotificationAuditDTO = async (
  data: EventDelivery[],
): Promise<EventNotificationAuditDTO[]> => {
  const eventConfigs = await eventConfigService.getAllEventConfigs();

  return Promise.all(
    data.map(async (eventNotificationAudit) => {
      const eventConfig = eventConfigs.find(
        (e) => e.id === eventNotificationAudit.eventConfigId,
      );

      return {
        ...eventNotificationAudit,
        eventConfig: toIdValue(eventConfig, "eventName"),
      };
    }),
  );
};

export const toNotificationDto = async (
  notifications: NotificationInput[],
): Promise<NotificationDTO[]> => {
  return Promise.all(
    notifications.map(async (notification) => {
      return {
        ...notification,
        level1: toIdValue(notification.level1, "colName"),
        user: toIdValue(notification.user, "name"),
      };
    }),
  );
};
