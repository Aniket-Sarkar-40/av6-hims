import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";

export const createFeatureFlagSchema = Joi.object({
  shortCode: Joi.string().trim().required().messages({
    "string.base": `Short Code must be a string`,
    "string.empty": `Short Code cannot be empty`,
    "any.required": `Short Code is required`,
  }),
  flagName: Joi.string().trim().required().messages({
    "string.base": `Flag Name must be a string`,
    "string.empty": `Flag Name cannot be empty`,
    "any.required": `Flag Name is required`,
  }),
  isEnabled: Joi.boolean().required().messages({
    "boolean.base": `Is Enabled must be a boolean`,
    "any.required": `Is Enabled is required`,
  }),
  description: Joi.string().required().messages({
    "string.base": `Description must be a string`,
    "string.empty": `Description cannot be empty`,
    "any.required": `Description is required`,
  }),
  featureConfig: Joi.any().optional().allow("", null).messages({
    "any.required": `Feature Config is not required`,
  }),
});

export const updateFeatureFlagSchema = createFeatureFlagSchema.keys({
  id: Joi.number().required().messages({
    "number.base": "ID must be a number",
    "any.required": "ID is required",
  }),
});

export function validateCreateFeatureFlag(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = createFeatureFlagSchema.validate(req.body, {
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
}

export function validateUpdateFeatureFlag(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = updateFeatureFlagSchema.validate(req.body, {
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
}
