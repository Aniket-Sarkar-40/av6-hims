import { CreateOrUpdateEmailConfig } from "@/types/event/emailConfig.js";
import { strOptional } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const emailConfigSchema = Joi.object<CreateOrUpdateEmailConfig>({
  emailType: strOptional("Email type"),
  smtpServer: strOptional("SMTP Server"),
  smtpPort: strOptional("SMTP Port"),
  smtpUsername: strOptional("SMTP Username"),
  smtpPassword: strOptional("SMTP Password"),
  sslTls: strOptional("SSL/TLS"),
});

export const validateEmailConfig = validationHandler({
  schema: emailConfigSchema,
});
