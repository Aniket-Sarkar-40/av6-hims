import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

/**
 * Joi schema for creating or updating email configuration
 */
export const emailConfigSchema = Joi.object({
  emailType: Joi.string().allow(null).messages({
    "string.base": "Email Type must be a string.",
  }),
  smtpServer: Joi.string().allow(null).messages({
    "string.base": "SMTP Server must be a string.",
  }),
  smtpPort: Joi.string().allow(null).messages({
    "string.base": "SMTP Port must be a string.",
  }),
  smtpUsername: Joi.string().allow(null).messages({
    "string.base": "SMTP Username must be a string.",
  }),
  smtpPassword: Joi.string().allow(null).messages({
    "string.base": "SMTP Password must be a string.",
  }),
  sslTls: Joi.string().allow(null).messages({
    "string.base": "SSL/TLS must be a string.",
  }),
  isActive: Joi.string().valid("yes", "no").required().messages({
    "any.only": `'isActive' must be one of ['yes', 'no']`,
    "any.required": `'isActive' is required.`,
  }),
});

/**
 * Validation middleware for creating or updating email configuration
 */
export const validateEmailConfig = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = emailConfigSchema.validate(req.body, {
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
