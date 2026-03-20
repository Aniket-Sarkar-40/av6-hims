import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  CalculationMethod,
  RoundFormat,
} from "@repo/db/generated/prisma/client";
import { ValidationErrorItem } from "av6-core";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const createOrUpdateSettingsSchema = Joi.object({
  isEmail: Joi.boolean()
    .required()
    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Is Email"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Is Email"),
    }),
  isSMS: Joi.boolean()
    .required()
    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Is SMS"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Is SMS"),
    }),
  isWhatsapp: Joi.boolean()
    .required()
    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Is WhatsApp"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Is WhatsApp"),
    }),
  countryCode: Joi.string()
    .optional()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Country code"),
    }),
  defaultPrecision: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Default precision",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Default precision",
      ),
      "number.min": generateValidationErrorMessage(
        "NON_NEGATIVE",
        "Default precision",
      ),
    }),
  calculationMethod: Joi.string()
    .valid(...Object.values(CalculationMethod))
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Calculation Method",
      ),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Calculation Method",
        Object.values(CalculationMethod).join(", "),
      ),
    }),
  roundedFormat: Joi.string()
    .valid(...Object.values(RoundFormat))
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Rounded format"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Rounded format",
        Object.values(RoundFormat).join(", "),
      ),
    }),
  finalRoundedFormat: Joi.string()
    .valid(...Object.values(RoundFormat))
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Final round format",
      ),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Final round  format",
        Object.values(RoundFormat).join(", "),
      ),
    }),

  batchSize: Joi.number()
    .positive()
    .optional()
    .allow(null)
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Batch size"),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Batch size",
      ),
    }),
  defaultEmailPostfix: Joi.string()
    .optional()
    .allow(null)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Default email postfix",
      ),
    }),
});

export const validateSettings = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = createOrUpdateSettingsSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    const messages = (error.details as ValidationErrorItem[])
      .map((d) => d.message.replace(/['"]/g, ""))
      .join(", ");
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: messages,
        errors: error.details,
      }),
    );
  }

  next();
};
