import { CurrencyReq } from "@/types/master/currency.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const currencySchema = Joi.object<CurrencyReq>({
  code: Joi.string().trim().min(2).max(5).required().messages({
    "string.base": "Code must be a string",
    "string.min": "Code must be at least 2 characters",
    "string.max": "Code must be at most 5 characters",
    "string.empty": "Code is required",
    "any.required": "Code is required",
  }),

  name: Joi.string().trim().min(1).max(100).required().messages({
    "string.base": "Name must be a string",
    "string.min": "Name must be at least 1 character",
    "string.max": "Name must be at most 100 characters",
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),

  symbol: Joi.string().trim().max(5).allow(null).optional().messages({
    "string.base": "Symbol must be a string",
    "string.max": "Symbol must be at most 5 characters",
    "string.empty": "Symbol can be null or a string",
  }),
});

export const currencyUpdateSchema = currencySchema.keys({
  id: Joi.number().integer().min(1).required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "number.min": "Id must be at least 1",
  }),
});

export const validateCurrency = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = currencySchema.validate(req.body, { abortEarly: false });

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

export const validateUpdateCurrency = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = currencyUpdateSchema.validate(req.body, {
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
