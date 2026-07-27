import { CreateOrUpdateAuditConfig } from "@/types/master/auditConfig.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

import Joi from "joi";

export const auditConfigCreateSchema = Joi.object<CreateOrUpdateAuditConfig>({
  module: Joi.string()
    .trim()
    .valid(...Object.values(ServiceCode))
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Module"),
      "string.empty": generateValidationErrorMessage("REQUIRED", "Module"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Module",
        Object.values(ServiceCode).join(", "),
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Module"),
    }),

  service: Joi.string()
    .trim()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Service"),
      "string.empty": generateValidationErrorMessage("REQUIRED", "Service"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Service"),
    }),

  method: Joi.string()
    .trim()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Method"),
      "string.empty": generateValidationErrorMessage("REQUIRED", "Method"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Method"),
    }),

  message: Joi.string()
    .trim()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Message"),
    }),

  isAuditable: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Is Auditable"),
    }),
});

export const auditConfigUpdateSchema = auditConfigCreateSchema.keys({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "ID"),
      "number.integer": generateValidationErrorMessage("NUMBER", "ID"),
      "number.positive": generateValidationErrorMessage("POSITIVE", "ID"),
      "any.required": generateValidationErrorMessage("REQUIRED", "ID"),
    }),
});

export const validateAuditConfigCreate = validationHandler({
  schema: auditConfigCreateSchema,
});

export const validateAuditConfigUpdate = validationHandler({
  schema: auditConfigUpdateSchema,
});
