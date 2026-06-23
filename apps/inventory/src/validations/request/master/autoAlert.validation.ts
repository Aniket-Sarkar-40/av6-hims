import { INV_ALERT_TYPE } from "@repo/db/generated/prisma/enums.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
const commaSeparatedEmailRegex =
  /^\s*([^\s,]+@[^\s,]+)\s*(,\s*[^\s,]+@[^\s,]+)*\s*$/;
export const createAutoAlertEmailSchema = Joi.object({
  shortCode: Joi.string()
    .trim()
    .valid(...Object.values(INV_ALERT_TYPE))
    .required()
    .messages({
      "string.base": `Short Code must be a string`,
      "string.empty": `Short Code cannot be empty`,
      "any.required": `Short Code is required`,
      "any.only": `Short Code must be one of ${Object.values(
        INV_ALERT_TYPE
      ).join(", ")}`,
    }),

  to: Joi.string()
    .trim()
    .pattern(commaSeparatedEmailRegex)
    .required()
    .min(1)
    .messages({
      "string.base": `To Email must be a string`,
      "string.empty": `To Email cannot be empty`,
      "any.required": `To Email is required`,
      "string.pattern.base": `To Email must be valid comma-separated emails`,
    }),

  cc: Joi.alternatives()
    .try(Joi.string().trim().pattern(commaSeparatedEmailRegex), Joi.valid(null))
    .messages({
      "string.pattern.base": "CC Email must be valid comma-separated emails",
      "string.empty": "CC Email cannot be empty",
    }),

  bcc: Joi.alternatives()
    .try(Joi.string().trim().pattern(commaSeparatedEmailRegex), Joi.valid(null))
    .messages({
      "string.pattern.base": "BCC Email must be valid comma-separated emails",
      "string.empty": "BCC Email cannot be empty",
    }),
});

export const updateAutoAlertEmailSchema = createAutoAlertEmailSchema.keys({
  id: Joi.number().required().positive().integer().strict().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
    "number.positive": "ID must be a positive integer",
    "any.required": "ID is required",
  }),
});

export function validateCreateAutoAlertEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = createAutoAlertEmailSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    const messages = error.details
      .map((d) => d.message.replace(/['"]/g, ""))
      .join(", ");
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: messages,
        errors: error.details,
      })
    );
  }

  next();
}

export function validateUpdateAutoAlertEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error } = updateAutoAlertEmailSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    const messages = error.details
      .map((d) => d.message.replace(/['"]/g, ""))
      .join(", ");
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: messages,
        errors: error.details,
      })
    );
  }

  next();
}
