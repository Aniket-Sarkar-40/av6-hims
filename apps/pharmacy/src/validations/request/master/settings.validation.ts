import { CreateOrUpdateSettings } from "@/types/master/settings.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import {
  CalculationMethod,
  RoundFormat,
} from "@repo/db/generated/prisma/enums.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const createOrUpdateSettingsSchema = Joi.object<CreateOrUpdateSettings>({
  isEmail: Joi.boolean().required().messages({
    "boolean.base": "Is Email must be a boolean",
    "any.required": "Is Email is required",
  }),
  isSMS: Joi.boolean().required().messages({
    "boolean.base": "Is SMS must be a boolean",
    "any.required": "Is SMS is required",
  }),
  isWhatsapp: Joi.boolean().required().messages({
    "boolean.base": "Is Whatsapp must be a boolean",
    "any.required": "Is Whatsapp is required",
  }),
  expiryInMonth: Joi.number().positive().required().strict().messages({
    "number.base": "Expiry in month must be a number",
    "number.positive": "Expiry in month must be a positive number",
    "any.required": "Expiry in month is required",
  }),
  countryCode: Joi.string().optional().allow(null, "").messages({
    "string.base": "Country code must be a string",
  }),
  slowMovingTimeInMonth: Joi.number()
    .positive()
    .optional()
    .allow(null)
    .strict()
    .messages({
      "number.base": "Slow moving time in month must be a number",
      "number.positive": "Slow moving time in month must be a positive number",
    }),

  // new fields:
  poPrecision: Joi.number().integer().min(0).optional().messages({
    "number.base": "Purchase order precision must be a number",
    "number.integer": "Purchase order precision must be an integer",
    "number.min": "Purchase order precision cannot be negative",
  }),
  poCalculationMethod: Joi.string()
    .valid(...Object.values(CalculationMethod))
    .optional()
    .messages({
      "string.base": "PO calculation method must be a string",
      "any.only": `PO calculation method must be one of ${Object.values(CalculationMethod).join(", ")}`,
    }),
  defaultPrecision: Joi.number().integer().min(0).optional().messages({
    "number.base": "Default precision must be a number",
    "number.integer": "Default precision must be an integer",
    "number.min": "Default precision cannot be negative",
  }),
  itemPrecision: Joi.number().integer().min(0).optional().messages({
    "number.base": "Item precision must be a number",
    "number.integer": "Item precision must be an integer",
    "number.min": "Item precision cannot be negative",
  }),
  sellPrecision: Joi.number().integer().min(0).optional().messages({
    "number.base": "Sell precision must be a number",
    "number.integer": "Sell precision must be an integer",
    "number.min": "Sell precision cannot be negative",
  }),
  grnPrecision: Joi.number().integer().min(0).optional().messages({
    "number.base": "GRN precision must be a number",
    "number.integer": "GRN precision must be an integer",
    "number.min": "GRN precision cannot be negative",
  }),

  grnCalculationMethod: Joi.string()
    .valid(...Object.values(CalculationMethod))
    .optional()
    .messages({
      "string.base": "GRN calculation method must be a string",
      "any.only": `GRN calculation method must be one of ${Object.values(CalculationMethod).join(", ")}`,
    }),
  sellCalculationMethod: Joi.string()
    .valid(...Object.values(CalculationMethod))
    .optional()
    .messages({
      "string.base": "Sell calculation method must be a string",
      "any.only": `Sell calculation method must be one of ${Object.values(CalculationMethod).join(", ")}`,
    }),
  grnRoundedFormat: Joi.string()
    .valid(...Object.values(RoundFormat))
    .optional()
    .messages({
      "string.base": "GRN rounded format must be a string",
      "any.only": `GRN rounded format must be one of ${Object.values(RoundFormat).join(", ")}`,
    }),
  sellRoundedFormat: Joi.string()
    .valid(...Object.values(RoundFormat))
    .optional()
    .messages({
      "string.base": "Sell rounded format must be a string",
      "any.only": `Sell rounded format must be one of ${Object.values(RoundFormat).join(", ")}`,
    }),
  grnFinalRoundedFormat: Joi.string()
    .valid(...Object.values(RoundFormat))
    .optional()
    .messages({
      "string.base": "GRN final rounded format must be a string",
      "any.only": `GRN final rounded format must be one of ${Object.values(RoundFormat).join(", ")}`,
    }),
  sellFinalRoundedFormat: Joi.string()
    .valid(...Object.values(RoundFormat))
    .optional()
    .messages({
      "string.base": "Sell final rounded format must be a string",
      "any.only": `Sell final rounded format must be one of ${Object.values(RoundFormat).join(", ")}`,
    }),
  batchSize: Joi.number().positive().optional().allow(null).strict().messages({
    "number.base": "Batch size must be a number",
    "number.positive": "Batch size must be a positive number",
    "any.optional": "Batch size is optional",
  }),
  defaultEmailPostfix: Joi.string()
    .optional()
    .allow(null, "")
    .strict()
    .messages({
      "string.base": "Default email postfix must be a number",
      "string.positive": "Default email postfix must be a positive number",
      "any.optional": "Default email postfix is optional",
    }),
});

export const validateSettings = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = createOrUpdateSettingsSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      }),
    );
  }

  next();
};
