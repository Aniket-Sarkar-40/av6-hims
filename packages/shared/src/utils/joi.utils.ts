import Joi from "joi";
import { generateValidationErrorMessage } from "./responseMessage.utils.js";
import { getPattern } from "av6-utils";

export const priceRequired = (label: string) =>
  Joi.number()
    .min(0)
    .required()
    .precision(2)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", label),
      "number.min": generateValidationErrorMessage("NON_NEGATIVE", label),
      "any.required": generateValidationErrorMessage("REQUIRED", label),
    });

export const dateRequired = (label: string) =>
  Joi.date()
    .required()
    .messages({
      "any.required": `${label} is required`,
      "date.base": `${label} must be a valid date`,
    });

export const dateOptional = (label: string) =>
  Joi.date()
    .optional()
    .messages({
      "date.base": `${label} must be a valid date`,
    });

export const strRequired = (label: string, max = 255) =>
  Joi.string()
    .trim()
    .max(max)
    .required()
    .messages({
      "any.required": `${label} is required`,
      "string.base": `${label} must be a string`,
      "string.max": `${label} must be at most ${max} characters`,
    });

export const strOptional = (label: string, max = 255) =>
  Joi.string()
    .trim()
    .max(max)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": `${label} must be a string`,
      "string.max": `${label} must be at most ${max} characters`,
    });

export const boolOptional = (label: string, defaultValue: boolean = false) =>
  Joi.boolean()
    .default(defaultValue)
    .optional()
    .messages({
      "boolean.base": `${label} must be a boolean`,
    });

export const boolRequired = (label: string, defaultValue: boolean = false) =>
  Joi.boolean()
    .default(defaultValue)
    .required()
    .messages({
      "boolean.base": `${label} must be a boolean`,
      "any.required": `${label} is required`,
    });

export const enumRequired = <T extends Record<string, string>>(
  label: string,
  enumObj: T
) =>
  Joi.string()
    .valid(...(Object.values(enumObj) as string[]))
    .required()
    .invalid("")
    .trim()
    .messages({
      "any.required": `${label} is required`,
      "string.base": `${label} must be a string`,
      "any.only": `${label} must be one of [${Object.values(enumObj).join(
        ", "
      )}]`,
    });

export const enumOptional = <T extends Record<string, string>>(
  label: string,
  enumObj: T
) =>
  Joi.string()
    .valid(...(Object.values(enumObj) as string[]))
    .optional()
    .allow(null, "")
    .trim()
    .messages({
      "string.base": `${label} must be a string`,
      "any.only": `${label} must be one of [${Object.values(enumObj).join(
        ", "
      )}]`,
    });

export const idRequired = (label: string) =>
  Joi.number()
    .integer()
    .positive()
    .required()

    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", label),
      "number.integer": generateValidationErrorMessage("INTEGER", label),
      "number.positive": generateValidationErrorMessage("POSITIVE", label),
      "any.required": generateValidationErrorMessage("REQUIRED", label),
    });

export const idOptional = (label: string) =>
  Joi.number()
    .integer()
    .allow("", null)
    .optional()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", label),
      "number.integer": generateValidationErrorMessage("INTEGER", label),
      "number.positive": generateValidationErrorMessage("POSITIVE", label),
    });

export const jsonObjectRequired = (label: string) =>
  Joi.object()
    .required()
    .messages({
      "object.base": generateValidationErrorMessage("JSON_OBJECT", label),
      "any.required": generateValidationErrorMessage("REQUIRED", label),
    });

export const jsonObjectOptional = (label: string) =>
  Joi.object()
    .optional()
    .allow(null, "")
    .messages({
      "object.base": generateValidationErrorMessage("JSON_OBJECT", label),
      "any.required": generateValidationErrorMessage("REQUIRED", label),
    });

export const EmailOptional = (label: string) =>
  Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .pattern(getPattern.emailPattern!)
    .allow(null, "")
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", label),
      "string.email": generateValidationErrorMessage("EMAIL", label),
      "string.pattern.base": generateValidationErrorMessage("INVALID", label),
    });

export const EmailRequired = (label: string) =>
  Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .pattern(getPattern.emailPattern!)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", label),
      "string.email": generateValidationErrorMessage("EMAIL", label),
      "string.pattern.base": generateValidationErrorMessage("INVALID", label),
      "any.required": generateValidationErrorMessage("REQUIRED", label),
    });

export const PhoneOptional = (label: string) =>
  Joi.string()
    .trim()
    .pattern(getPattern.phonePattern!)
    .allow(null, "")
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", label),
      "string.pattern.base": generateValidationErrorMessage("INVALID", label),
    });

export const PhoneRequired = (label: string) =>
  Joi.string()
    .trim()
    .pattern(getPattern.phonePattern!)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", label),
      "string.pattern.base": generateValidationErrorMessage("INVALID", label),
      "any.required": generateValidationErrorMessage("REQUIRED", label),
    });
