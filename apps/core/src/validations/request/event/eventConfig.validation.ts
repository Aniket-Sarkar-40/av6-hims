import Joi from "joi";
import {
  AttachmentRequired,
  NotificationType,
  NotificationPriority,
} from "@repo/db/generated/prisma/client";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import {
  boolOptional,
  enumOptional,
  idOptional,
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";

const SHORT_CODE_REGEX = /^[A-Z]+(_[A-Z]+)*$/;

const eventConfigKeyItemSchema = Joi.object({
  id: idOptional("Event Config Key ID"),

  key: strRequired("Key"),

  defaultValue: strRequired("Default Value"),
}).unknown(false);

const eventConfigMasterSchema = Joi.object({
  id: idOptional("ID"),

  serviceEventId: idRequired("Service Event ID"),

  eventName: strRequired("Event Name"),

  shortCode: strRequired("Short Code").pattern(SHORT_CODE_REGEX).messages({
    "string.pattern.base":
      "Short Code must be uppercase and underscore only (example: EVENT_CONFIG).",
  }),

  allowEmail: boolOptional("Allow Email"),
  allowSms: boolOptional("Allow SMS"),
  allowWhatsapp: boolOptional("Allow WhatsApp"),
  allowAppNotification: boolOptional("Allow App Notification"),
  allowWebNotification: boolOptional("Allow Web Notification"),

  attachmentRequired: enumOptional("Attachment Required", AttachmentRequired),
  notificationType: enumOptional("Notification Type", NotificationType),
  priority: enumOptional("Priority", NotificationPriority),

  channelId: strOptional("Channel ID"),
});

const markReadNotificationsSchema = Joi.object({
  ids: Joi.array().items(idRequired("Notification id")).min(1),
});

export const upsertEventConfigWithKeysSchema = Joi.object({
  eventConfig: eventConfigMasterSchema.required(),

  keys: Joi.array().items(eventConfigKeyItemSchema).min(1).required(),
});

export const validateUpsertEventConfigWithKeys = validationHandler({
  schema: upsertEventConfigWithKeysSchema,
});

export const validateMarkReadNotifications = validationHandler({
  schema: markReadNotificationsSchema,
});
