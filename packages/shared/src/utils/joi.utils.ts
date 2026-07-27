import { getPattern } from "av6-utils";
import Joi, { SchemaLikeWithoutArray } from "joi";
import { generateValidationErrorMessage } from "./responseMessage.utils.js";

export const priceRequired = (label: string, getPrecision?: () => number) =>
  Joi.number()
    .min(0)
    .required()
    .precision(getPrecision?.() ?? 2)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", label),
      "number.min": generateValidationErrorMessage("NON_NEGATIVE", label),
      "any.required": generateValidationErrorMessage("REQUIRED", label),
    });

export const priceOptional = (label: string, getPrecision?: () => number) =>
  Joi.number()
    .min(0)
    .optional()
    .allow(null)
    .precision(getPrecision?.() ?? 2)
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
    .allow(null)
    .messages({
      "date.base": `${label} must be a valid date`,
    });

export const strRequired = (label: string, min = 1, max = 255) =>
  Joi.string()
    .trim()
    .max(max)
    .min(min)
    .required()
    .messages({
      "any.required": `${label} is required`,
      "string.base": `${label} must be a string`,
      "string.max": `${label} must be at most ${max} characters`,
      "string.min": `${label} must be at least ${min} characters`,
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

const baseBoolean = (
  label: string,
  options?: {
    required?: boolean;
    defaultValue?: boolean;
  },
) => {
  let schema = Joi.boolean();

  if (options?.required) {
    schema = schema.required();
  } else {
    schema = schema.optional();
  }

  if (options?.defaultValue !== undefined) {
    schema = schema.default(options.defaultValue);
  }

  return schema.messages({
    "boolean.base": generateValidationErrorMessage("BOOLEAN", label),
    ...(options?.required && {
      "any.required": generateValidationErrorMessage("REQUIRED", label),
    }),
  });
};

export const boolRequired = (label: string) =>
  baseBoolean(label, { required: true });

export const boolOptional = (label: string) => baseBoolean(label);

export const boolWithDefault = (label: string, defaultValue = false) =>
  baseBoolean(label, { defaultValue });

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

const baseArray = (
  label: string,
  itemSchema: SchemaLikeWithoutArray,
  options?: {
    min?: number;
    required?: boolean;
  },
) => {
  let schema = Joi.alternatives().try(
    Joi.array().items(itemSchema),
    Joi.string().custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);

        if (!Array.isArray(parsed)) {
          return helpers.error("array.base");
        }

        return parsed;
      } catch (err) {
        return helpers.error("array.base");
      }
    }),
  );

  if (options?.min !== undefined) {
    schema = schema.custom((value, helpers) => {
      if (Array.isArray(value) && value.length < options.min!) {
        return helpers.error("array.min");
      }
      return value;
    });
  }

  if (options?.required) {
    schema = schema.required();
  } else {
    schema = schema.optional().allow(null);
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

export const numberArrayRequired = (label: string, min = 1) => {
  return Joi.any()
    .custom((value, helpers) => {
      let finalValue = value;

      // 🔁 Handle JSON string input
      if (typeof value === "string") {
        try {
          finalValue = JSON.parse(value);
        } catch {
          return helpers.error("array.base");
        }
      }

      // ❌ Must be array
      if (!Array.isArray(finalValue)) {
        return helpers.error("array.base");
      }

      // ❌ Min validation
      if (finalValue.length < min) {
        return helpers.error("array.min");
      }

      // ❌ Strict number validation
      for (const item of finalValue) {
        if (typeof item !== "number" || !Number.isInteger(item) || item <= 0) {
          return helpers.error("array.includes");
        }
      }

      return finalValue;
    })
    .required()
    .messages({
      "any.required": generateValidationErrorMessage("REQUIRED", label),
      "array.base": generateValidationErrorMessage("ARRAY", label),
      "array.min": generateValidationErrorMessage("MIN", label, String(min)),
      "array.includes": `${label} must contain only positive integers`,
    });
};

export const numberArrayOptional = (label: string, min?: number) => {
  return Joi.any()
    .custom((value, helpers) => {
      if (value === null || value === undefined) return value;

      let finalValue = value;

      // 🔁 Handle JSON string
      if (typeof value === "string") {
        try {
          finalValue = JSON.parse(value);
        } catch {
          return helpers.error("array.base");
        }
      }

      // ❌ Must be array
      if (!Array.isArray(finalValue)) {
        return helpers.error("array.base");
      }

      // ❌ Min check (if provided)
      if (min !== undefined && finalValue.length < min) {
        return helpers.error("array.min");
      }

      // ❌ Strict number validation
      for (const item of finalValue) {
        if (typeof item !== "number" || !Number.isInteger(item) || item <= 0) {
          return helpers.error("array.includes");
        }
      }

      return finalValue;
    })
    .optional()
    .allow(null)
    .messages({
      "array.base": generateValidationErrorMessage("ARRAY", label),
      ...(min !== undefined && {
        "array.min": generateValidationErrorMessage("MIN", label, String(min)),
      }),
      "array.includes": `${label} must contain only positive integers`,
    });
};

export const numberWithMaxDecimals = (
  fieldName: string,
  getPrecision?: () => number,
) => {
  const precision = getPrecision?.() ?? 2;

  return Joi.number()
    .min(0)
    .messages({
      "number.base": `${fieldName} must be a valid number`,
      "number.positive": `${fieldName} must be a positive number`,
    })
    .custom((value, helpers) => {
      const raw = value.toString();
      const [, decPart = ""] = raw.split(".");

      if (decPart.length > precision) {
        return helpers.error("number.decimals");
      }

      return value;
    })
    .messages({
      "number.decimals": `${fieldName} must have at most ${precision} decimal places`,
    });
};

export const numberWithMaxDecimalsRequired = (
  fieldName: string,
  getPrecision?: () => number,
) =>
  numberWithMaxDecimals(fieldName, getPrecision)
    .required()
    .messages({
      "any.required": `${fieldName} is required`,
    });

export const numberWithMaxDecimalsOptional = (
  fieldName: string,
  getPrecision?: () => number,
) => numberWithMaxDecimals(fieldName, getPrecision).optional().allow(null, 0);

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

export const intRequired = (
  label: string,
  min?: number | Joi.Reference,
  max?: number | Joi.Reference,
) => {
  let schema = Joi.number().integer().required();

  if (min !== undefined) schema = schema.min(min);
  if (max !== undefined) schema = schema.max(max);

  return schema.messages({
    "number.base": generateValidationErrorMessage("NUMBER", label),
    "number.integer": generateValidationErrorMessage("INTEGER", label),
    "number.min": generateValidationErrorMessage(
      "MIN_VALUE",
      label,
      String(min),
    ),
    "number.max": generateValidationErrorMessage(
      "MAX_VALUE",
      label,
      String(max),
    ),
    "any.required": generateValidationErrorMessage("REQUIRED", label),
  });
};

export const intOptional = (
  label: string,
  min?: number | Joi.Reference,
  max?: number | Joi.Reference,
) => {
  let schema = Joi.number().min(0).optional().allow(null);

  if (min !== undefined) {
    schema = schema.min(typeof min === "number" ? Math.max(0, min) : min);
  }
  if (max !== undefined) schema = schema.max(max);

  return schema.messages({
    "number.base": generateValidationErrorMessage("NUMBER", label),
    "number.integer": generateValidationErrorMessage("INTEGER", label),
    "number.min": generateValidationErrorMessage(
      "MIN_VALUE",
      label,
      String(min),
    ),
    "number.max": generateValidationErrorMessage(
      "MAX_VALUE",
      label,
      String(max),
    ),
  });
};

export const patternRequired = (label: string, pattern: RegExp) =>
  Joi.string()
    .trim()
    .strict()
    .pattern(pattern)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", label),
      "string.pattern.base": generateValidationErrorMessage("PATTERN", label),
      "any.required": generateValidationErrorMessage("REQUIRED", label),
    });

export const patternOptional = (label: string, pattern: RegExp) =>
  Joi.string()
    .trim()
    .strict()
    .pattern(pattern)
    .optional()
    .allow(null)
    .empty("")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", label),
      "string.pattern.base": generateValidationErrorMessage("PATTERN", label),
    });

export const decimalRequired = (label: string, precision = 2) =>
  Joi.number()
    .strict()
    .precision(precision)
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", label),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        label,
        String(precision),
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", label),
    });

export const decimalOptional = (label: string, precision = 2) =>
  Joi.number()
    .strict()
    .precision(precision)
    .optional()
    .allow(null)
    .empty("")
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", label),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        label,
        String(precision),
      ),
    });

export const modelFieldRequired = (label: string) =>
  Joi.string()
    .trim()
    .pattern(/^[a-z][a-zA-Z0-9]*$/)
    .required()
    .messages({
      "any.required": generateValidationErrorMessage("REQUIRED", label),
      "string.base": generateValidationErrorMessage("STRING", label),
      "string.pattern.base": generateValidationErrorMessage(
        "INVALID_FORMAT",
        label,
      ),
    });

export const scalarValueRequired = (label: string) =>
  Joi.any()
    .allow(null)
    .required()
    .messages({
      "any.required": generateValidationErrorMessage("REQUIRED", label),
    });
