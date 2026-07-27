import { CreateOrUpdateEmailConfig } from "@/types/master/emailConfig.js";
import { EmailConfigType } from "@repo/db/generated/prisma/enums.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const emailConfigSchema = Joi.object<CreateOrUpdateEmailConfig>({
  emailType: Joi.string()
    .trim()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Email Type"),
    }),
  smtpServer: Joi.string()
    .trim()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "SMTP Server"),
    }),
  smtpPort: Joi.string()
    .trim()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "SMTP Port"),
    }),
  smtpUsername: Joi.string()
    .trim()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "SMTP Username"),
    }),
  smtpPassword: Joi.string()
    .trim()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "SMTP Password"),
    }),
  sslTls: Joi.string()
    .trim()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "SSL/TLS"),
    }),
  configType: Joi.string()
    .trim()
    .valid(...Object.values(EmailConfigType))
    .allow(null)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Config Type"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Config Type",
        Object.values(EmailConfigType).join(", "),
      ),
    }),
});

export const validateEmailConfig = validationHandler({
  schema: emailConfigSchema,
});
