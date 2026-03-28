import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { MedCategoryInput } from "@/types/master/medCategory.js";
import { joiDecimalFromSettings } from "@/utils/commonCalculation.utils.js";

export const MedCategoryInputSchema = Joi.object<MedCategoryInput>({
  name: Joi.string().required().min(2).trim().messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),

  description: Joi.string().trim().allow(null, "").optional().messages({
    "string.base": "Description must be a string or null",
  }),
  minMarginB2CPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Min Margin B2C Percentage must be a number",
    "number.precision":
      "Min Margin B2C Percentage must have {{#limit}} decimal places",
    "number.optional": "Min Margin B2C Percentage is optional",
  }),
  minMarginB2BPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Min Margin B2B Percentage must be a number",
    "number.precision":
      "Min Margin B2B Percentage must have {{#limit}} decimal places",
    "number.optional": "Min Margin B2B Percentage is optional",
  }),
  loyaltyPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Loyalty Percentage must be a number",
    "number.precision":
      "Loyalty Percentage must have {{#limit}} decimal places",
    "number.optional": "Loyalty Percentage is optional",
  }),
});

export const validateMedCategoryInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = MedCategoryInputSchema.validate(req.body, {
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
export const MedCategoryInputSchemaUpdate = Joi.object<MedCategoryInput>({
  id: Joi.number().required().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
    "any.required": "ID is required",
  }),

  name: Joi.string().required().trim().messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),

  description: Joi.string().trim().allow(null, "").optional().messages({
    "string.base": "Description must be a string or null",
  }),
  minMarginB2CPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Min Margin B2C Percentage must be a number",
    "number.precision":
      "Min Margin B2C Percentage must have {{#limit}} decimal places",
    "number.optional": "Min Margin B2C Percentage is optional",
  }),
  minMarginB2BPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Min Margin B2B Percentage must be a number",
    "number.precision":
      "Min Margin B2B Percentage must have {{#limit}} decimal places",
    "number.optional": "Min Margin B2B Percentage is optional",
  }),
  loyaltyPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Loyalty Percentage must be a number",
    "number.precision":
      "Loyalty Percentage must have {{#limit}} decimal places",
    "number.optional": "Loyalty Percentage is optional",
  }),
});

export const validateMedCategoryInputUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = MedCategoryInputSchemaUpdate.validate(req.body, {
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
