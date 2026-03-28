import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const citySchema = Joi.object({
  name: Joi.string().required().min(2).trim().messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),

  countryId: Joi.number().required().messages({
    "number.base": "Country ID must be a number",
    "any.required": "Country ID is required",
  }),

  stateId: Joi.number().required().messages({
    "number.base": "State ID must be a number",
    "any.required": "State ID is required",
  }),
});

export const updateCitySchema = (citySchema as Joi.ObjectSchema).keys({
  id: Joi.number().integer().positive().required().strict().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
    "number.positive": "ID must be a positive integer",
    "any.required": "ID is required",
  }),
});
export const validateCity = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { value, error } = citySchema.validate(req.body, { abortEarly: false });

  req.body = value;

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

export const validateCityUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = updateCitySchema.validate(req.body, { abortEarly: false });

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
