import Joi from "joi";
import type { CreateServiceEvent } from "@/types/event/serviceEvent.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import {
  boolOptional,
  strOptional,
  enumRequired,
  enumOptional,
  idRequired,
} from "@repo/shared/utils/joi.utils.js";
import { ServiceCode, ServiceDomain } from "@repo/db/generated/prisma/client";

export const serviceEventCreateSchema = Joi.object<CreateServiceEvent>({
  service: enumRequired("Service", ServiceCode),

  allowEmail: boolOptional("Allow Email"),
  allowSms: boolOptional("Allow SMS"),
  allowWhatsapp: boolOptional("Allow WhatsApp"),
  allowAppNotification: boolOptional("Allow App Notification"),
  allowWebNotification: boolOptional("Allow Web Notification"),

  masterPhone: strOptional("Master Phone"),
  wpApiUrl: strOptional("WhatsApp API URL"),
  wpApiKey: strOptional("WhatsApp API Key"),
  countryCode: strOptional("Country Code"),
  wpLanguage: strOptional("WhatsApp Language"),
  wpCallback: strOptional("WhatsApp Callback Data"),

  smsApiUrl: strOptional("SMS API URL"),
  smsApiKey: strOptional("SMS API Key"),
  smsSenderId: strOptional("SMS Sender Id"),

  appNotificationApiUrl: strOptional("App Notification API URL"),

  serviceDomain: enumOptional("Service Domain", ServiceDomain),
});

export const serviceEventUpdateSchema = serviceEventCreateSchema.keys({
  id: idRequired("ID"),
});

export const serviceEventBulkUpdateSchema = Joi.array()
  .items(serviceEventUpdateSchema)
  .min(1)
  .required();

export const validateServiceEventCreate = validationHandler({
  schema: serviceEventCreateSchema,
});

export const validateServiceEventUpdate = validationHandler({
  schema: serviceEventBulkUpdateSchema,
});
