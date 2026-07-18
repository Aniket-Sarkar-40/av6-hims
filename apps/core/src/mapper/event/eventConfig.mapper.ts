import { serviceEventService } from "@/services/event/serviceEvent.service.js";
import { templateService } from "@/services/event/template.service.js";
import { EventConfigDTO } from "@/types/event/eventConfig.js";
import { EventConfig } from "@repo/db/generated/prisma/client";
import { customOmit } from "av6-core-v2";
import { toIdValue } from "av6-utils";

export const toEventConfigDTO = async (
  data: EventConfig[],
): Promise<EventConfigDTO[]> => {
  const serviceEvents = await serviceEventService.getAllServiceEvents();
  const templates = await templateService.getAllTemplates();

  return Promise.all(
    data.map(async (eventConfig) => {
      const omittedEventConfig = customOmit<
        EventConfig,
        "createdBy" | "updatedBy" | "createdAt" | "updatedAt"
      >(eventConfig, ["createdBy", "updatedBy", "createdAt", "updatedAt"]);

      const serviceEvent = serviceEvents.find(
        (e) => e.id === eventConfig.serviceEventId,
      );
      const emailTemplate =
        templates.find(
          (t) =>
            t.eventConfigId === eventConfig.id && t.templateType === "EMAIL",
        ) ?? null;

      const smsTemplate =
        templates.find(
          (t) => t.eventConfigId === eventConfig.id && t.templateType === "SMS",
        ) ?? null;
      const wpTemplate =
        templates.find(
          (t) =>
            t.eventConfigId === eventConfig.id && t.templateType === "WHATSAPP",
        ) ?? null;
      const appNotificationTemplate =
        templates.find(
          (t) =>
            t.eventConfigId === eventConfig.id &&
            t.templateType === "APP_NOTIFICATION",
        ) ?? null;
      const webNotificationTemplate =
        templates.find(
          (t) =>
            t.eventConfigId === eventConfig.id &&
            t.templateType === "WEB_NOTIFICATION",
        ) ?? null;

      return {
        ...omittedEventConfig.rest,
        serviceEvent: toIdValue(serviceEvent, "service"),
        emailTemplate: toIdValue(emailTemplate, "templateName"),
        smsTemplate: toIdValue(smsTemplate, "templateName"),
        wpTemplate: toIdValue(wpTemplate, "templateName"),
        appNotificationTemplate: toIdValue(
          appNotificationTemplate,
          "templateName",
        ),
        webNotificationTemplate: toIdValue(
          webNotificationTemplate,
          "templateName",
        ),
      };
    }),
  );
};
