import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { ServiceCode, PdfTemplateType } from "@repo/db/generated/prisma/client";
import Joi from "joi";

export const createPdfTemplateSchema = Joi.object({
  templateName: Joi.string()
    .trim()
    .min(3)
    .required()
    .messages({
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Template Name",
        "3"
      ),
      "string.empty": generateValidationErrorMessage("EMPTY", "Template Name"),
      "string.base": generateValidationErrorMessage("STRING", "Template Name"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Template Name"
      ),
    }),

  module: Joi.string()
    .valid(...Object.values(ServiceCode))
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Module"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Module",
        Object.values(ServiceCode).join(", ")
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Module"),
    }),

  templateType: Joi.string()
    .valid(...Object.values(PdfTemplateType))
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Template Type"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Template Type",
        Object.values(PdfTemplateType).join(", ")
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Template Type"
      ),
    }),

  bodyJson: Joi.object()
    .required()
    .messages({
      "object.base": generateValidationErrorMessage("JSON_OBJECT", "Body JSON"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Body JSON"),
    }),

  isDefault: Joi.boolean()
    .optional()
    .default(false)
    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Is Default"),
    }),

  sampleImageUrl: Joi.string()
    .optional()
    .allow(null)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Sample Image URL"
      ),
    }),
});

export const updatePdfTemplateSchema = createPdfTemplateSchema.keys({
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

export const makeDefaultPdfTemplateSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "ID"),
      "number.positive": generateValidationErrorMessage("POSITIVE", "ID"),
      "any.required": generateValidationErrorMessage("REQUIRED", "ID"),
    }),
});

export const validateCreatePdfTemplate = validationHandler({
  schema: createPdfTemplateSchema,
  type: "FORMDATA",
  imgAttr: "sampleImageUrl",
  jsonAttr: "bodyJson",
});
export const validateUpdatePdfTemplate = validationHandler({
  schema: updatePdfTemplateSchema,
  type: "FORMDATA",
});
export const validatemakeDefaultPdfTemplate = validationHandler({
  schema: makeDefaultPdfTemplateSchema,
  type: "FORMDATA",
});
