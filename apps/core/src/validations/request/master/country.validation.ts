import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const countrySchema = Joi.object<{
  alpha2Code: string | null;
  alpha3Code: string | null;
  enShortName: string | null;
  nationality: string;
}>({
  alpha2Code: Joi.string()
    .trim()
    .length(2)
    .uppercase()
    .allow(null)
    .required()
    .messages({
      "string.base": "Alpha-2 code must be a string",
      "string.length": "Alpha-2 code must be exactly 2 characters",
      "string.empty": "Alpha-2 code cannot be empty",
      "any.required": "Alpha-2 code is required",
    }),

  alpha3Code: Joi.string()
    .trim()
    .length(3)
    .uppercase()
    .allow(null)
    .required()
    .messages({
      "string.base": "Alpha-3 code must be a string",
      "string.length": "Alpha-3 code must be exactly 3 characters",
      "string.empty": "Alpha-3 code cannot be empty",
      "any.required": "Alpha-3 code is required",
    }),

  enShortName: Joi.string()
    .trim()
    .min(2)
    .max(52)
    .allow(null)
    .required()
    .messages({
      "string.base": "Short name must be a string",
      "string.min": "Short name must be at least 2 characters",
      "string.max": "Short name must be at most 52 characters",
      "string.empty": "Short name cannot be empty",
      "any.required": "Short name is required",
    }),

  nationality: Joi.string().trim().min(2).max(39).required().messages({
    "string.base": "Nationality must be a string",
    "string.empty": "Nationality is required",
    "string.min": "Nationality must be at least 2 characters",
    "string.max": "Nationality must be at most 39 characters",
    "any.required": "Nationality is required",
  }),
});

export const updateCountrySchema = (countrySchema as Joi.ObjectSchema).keys({
  id: Joi.number().integer().positive().required().strict().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
    "number.positive": "ID must be a positive integer",
    "any.required": "ID is required",
  }),
});

export const validateCountry = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = countrySchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      })
    );
  }

  next();
};

export const validateCountryUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = updateCountrySchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      })
    );
  }

  next();
};
