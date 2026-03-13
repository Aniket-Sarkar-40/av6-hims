// validation/countryCodeSchemas.ts
import Joi from "joi";

import { NextFunction, Request, Response } from "express";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";

export const createCountryCodeSchema = Joi.object({
  countryCode: Joi.string().trim().required().messages({
    "string.base": `Country Code must be a string`,
    "string.empty": `Country Code cannot be empty`,
    "any.required": `Country Code is required`,
  }),
  countryId: Joi.number().integer().required().messages({
    "number.base": `Country Id must be a number`,
    "number.integer": `Country Id must be an integer`,
    "any.required": `Country Id is required`,
  }),
});

export const updateCountryCodeSchema = createCountryCodeSchema.keys({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),
});

export const validateCountryCodeCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = createCountryCodeSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
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

export const validateCountryCodeUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = updateCountryCodeSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
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
