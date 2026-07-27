import { CreateOrUpdateTemplate } from "@/types/event/template.js";
import { idRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { TemplateType } from "@repo/db/generated/prisma/client";
import Joi from "joi";

export const templateExtraSchema = Joi.object({
  bodyValues: Joi.array().items(Joi.string()).optional(),

  fileUrls: Joi.array().items(Joi.string()).optional(),

  fileName: Joi.string().trim().optional(),
}).optional();

export const createTemplateSchema = Joi.object<CreateOrUpdateTemplate>({
  templateCode: Joi.string()
    .trim()
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Template Code"),
      "string.empty": generateValidationErrorMessage(
        "REQUIRED",
        "Template Code",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Template Code",
      ),
    }),

  eventConfigId: idRequired("Event config"),

  templateName: Joi.string()
    .trim()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Template Name"),
      "string.empty": generateValidationErrorMessage(
        "REQUIRED",
        "Template Name",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Template Name",
      ),
    }),

  templateType: Joi.string()
    .valid(...Object.values(TemplateType))
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Template Type"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Template Type",
        Object.values(TemplateType).join(", "),
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Template Type",
      ),
    }),

  subject: Joi.string()
    .trim()
    .allow(null, "")
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Subject"),
    }),

  bodyHtml: Joi.when("templateType", {
    is: TemplateType.EMAIL,
    then: Joi.string()
      .trim()
      .required()
      .messages({
        "string.base": generateValidationErrorMessage("STRING", "Body HTML"),
        "string.empty": generateValidationErrorMessage("REQUIRED", "Body HTML"),
        "any.required": generateValidationErrorMessage("REQUIRED", "Body HTML"),
      }),
    otherwise: Joi.string()
      .trim()
      .allow(null, "")
      .optional()
      .messages({
        "string.base": generateValidationErrorMessage("STRING", "Body HTML"),
      }),
  }),

  bodyText: Joi.when("templateType", {
    is: TemplateType.EMAIL,
    then: Joi.string()
      .trim()
      .allow(null, "")
      .forbidden()
      .optional()
      .messages({
        "string.base": generateValidationErrorMessage("STRING", "Body Text"),
        "any.forbidden": generateValidationErrorMessage(
          "FORBIDDEN",
          "Body Text",
        ),
      }),
    otherwise: Joi.string()
      .trim()
      .required()
      .messages({
        "string.base": generateValidationErrorMessage("STRING", "Body Text"),
        "string.empty": generateValidationErrorMessage("REQUIRED", "Body Text"),
        "any.required": generateValidationErrorMessage("REQUIRED", "Body Text"),
      }),
  }),

  url: Joi.when("templateType", {
    is: [TemplateType.APP_NOTIFICATION, TemplateType.WEB_NOTIFICATION],
    then: Joi.string()
      .trim()
      .allow(null, "")
      .optional()
      .messages({
        "string.base": generateValidationErrorMessage("STRING", "Url"),
      }),
    otherwise: Joi.forbidden().messages({
      "any.forbidden": generateValidationErrorMessage("FORBIDDEN", "Url"),
    }),
  }),

  extra: templateExtraSchema,
});

export const templateUpdateSchema = createTemplateSchema.keys({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "ID"),
      "number.positive": generateValidationErrorMessage("POSITIVE", "ID"),
      "any.required": generateValidationErrorMessage("REQUIRED", "ID"),
    }),
});

export const validateTemplateCreate = validationHandler({
  schema: createTemplateSchema,
});
export const validateTemplateUpdate = validationHandler({
  schema: templateUpdateSchema,
});
