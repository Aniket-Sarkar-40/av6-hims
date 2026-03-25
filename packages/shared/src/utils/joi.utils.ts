import Joi, { SchemaLikeWithoutArray } from "joi";
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

export const priceOptional = (label: string) =>
  Joi.number()
    .min(0)
    .optional()
    .allow(null)
    .precision(2)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", label),
      "number.min": generateValidationErrorMessage("NON_NEGATIVE", label),
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
  enumObj: T,
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
        ", ",
      )}]`,
    });

export const enumOptional = <T extends Record<string, string>>(
  label: string,
  enumObj: T,
) =>
  Joi.string()
    .valid(...(Object.values(enumObj) as string[]))
    .optional()
    .allow(null, "")
    .trim()
    .messages({
      "string.base": `${label} must be a string`,
      "any.only": `${label} must be one of [${Object.values(enumObj).join(
        ", ",
      )}]`,
    });

export const idRequired = (
  label: string,
  min?: number | Joi.Reference,
  max?: number | Joi.Reference,
) => {
  let schema = Joi.number().integer().required();

  if (max !== undefined) {
    schema = schema.max(max);
  }
  if (min !== undefined) {
    schema = schema.min(min);
  }

  return schema.messages({
    "number.base": generateValidationErrorMessage("NUMBER", label),
    "number.integer": generateValidationErrorMessage("INTEGER", label),
    "number.min": generateValidationErrorMessage(
      "MIN_VALUE",
      label,
      String(min),
    ),
    "number.max": generateValidationErrorMessage("MAX_VALUE", label),
    "any.required": generateValidationErrorMessage("REQUIRED", label),
  });
};

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

const baseArray = (
  label: string,
  itemSchema: SchemaLikeWithoutArray,
  options?: {
    min?: number;
    required?: boolean;
  },
) => {
  let schema = Joi.array().items(itemSchema);

  if (options?.min !== undefined) {
    schema = schema.min(options.min);
  }

  if (options?.required) {
    schema = schema.required();
  } else {
    schema = schema.optional();
  }

  return schema.messages({
    "array.base": generateValidationErrorMessage("ARRAY", label),
    ...(options?.min !== undefined && {
      "array.min": generateValidationErrorMessage(
        "MIN",
        label,
        String(options.min),
      ),
    }),
    ...(options?.required && {
      "any.required": generateValidationErrorMessage("REQUIRED", label),
    }),
  });
};

export const arrayRequired = (
  label: string,
  itemSchema: SchemaLikeWithoutArray,
  min = 1,
) => baseArray(label, itemSchema, { min, required: true });

export const arrayOptional = (
  label: string,
  itemSchema: SchemaLikeWithoutArray,
  min?: number,
) => baseArray(label, itemSchema, { min });

export const numberWithMaxDecimals = (fieldName: string, precision = 2) => {
  return Joi.number()
    .strict()
    .positive()
    .messages({
      "number.base": `${fieldName} must be a valid number`,
      "number.positive": `${fieldName} must be a positive number`,
    })
    .custom((value, helpers) => {
      const raw = value.toString();
      const [, decPart = ""] = raw.split(".");
      if (decPart.length > precision) {
        return helpers.error("number.decimals", { precision });
      }
      return value;
    })
    .messages({
      "number.decimals": `${fieldName} must have at most ${precision} decimal places`,
    });
};
export const numberWithMaxDecimalsRequired = (fieldName: string) =>
  numberWithMaxDecimals(fieldName)
    .required()
    .messages({ "any.required": `${fieldName} is required` });

export const emailRequired = (label: string) =>
  Joi.string()
    .trim()
    .email()
    .pattern(getPattern.emailPattern)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", label),
      "string.email": generateValidationErrorMessage("EMAIL", label),
      "string.pattern.base": generateValidationErrorMessage(
        "INVALID_FORMAT",
        label,
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", label),
      "string.empty": generateValidationErrorMessage("REQUIRED", label),
    });

export const emailOptional = (label: string) =>
  Joi.string()
    .trim()
    .email()
    .pattern(getPattern.emailPattern)
    .optional()
    .allow(null)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", label),
      "string.email": generateValidationErrorMessage("EMAIL", label),
      "string.pattern.base": generateValidationErrorMessage(
        "INVALID_FORMAT",
        label,
      ),
    });

export const pinCodeOptional = (label: string) =>
  Joi.number()
    .integer()
    .min(100000)
    .max(999999)
    .optional()
    .allow(null)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", label),
      "number.integer": generateValidationErrorMessage("INTEGER", label),
      "number.min": generateValidationErrorMessage("PINCODE", label),
      "number.max": generateValidationErrorMessage("PINCODE", label),
    });

export const forbiddenField = (label: string) =>
  Joi.forbidden().messages({
    "any.unknown": generateValidationErrorMessage("FORBIDDEN", label),
  });

export const phoneOptional = (label: string) =>
  Joi.string()
    .trim()
    .pattern(getPattern.phonePattern)
    .optional()
    .allow(null)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", label),
      "string.pattern.base": generateValidationErrorMessage("PHONE", label),
    });

export const phoneRequired = (label: string) =>
  Joi.string()
    .trim()
    .pattern(getPattern.phonePattern)
    .required()
    .messages({
      "any.required": generateValidationErrorMessage("REQUIRED", label),
      "string.base": generateValidationErrorMessage("STRING", label),
      "string.empty": generateValidationErrorMessage("REQUIRED", label),
      "string.pattern.base": generateValidationErrorMessage("PHONE", label),
    });

export const aadharRequired = (label: string) =>
  Joi.string()
    .trim()
    .pattern(/^\d{12}$/)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", label),
      "string.empty": generateValidationErrorMessage("REQUIRED", label),
      "string.pattern.base": generateValidationErrorMessage("AADHAR", label),
      "any.required": generateValidationErrorMessage("REQUIRED", label),
    });

export const aadharOptional = (label: string) =>
  Joi.string()
    .trim()
    .pattern(/^\d{12}$/)
    .optional()
    .allow(null)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", label),
      "string.pattern.base": generateValidationErrorMessage("AADHAR", label),
    });
