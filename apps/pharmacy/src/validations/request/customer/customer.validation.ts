import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/types/customer/customer.js";
import { PmsGender } from "@repo/db/generated/prisma/enums.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { getPattern } from "av6-core";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const commonCustomerSchema = Joi.object<
  CreateCustomerInput | UpdateCustomerInput
>({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .pattern(getPattern.nameWithNumPattern)
    .messages({
      "string.base": "Name must be a string.",
      "string.empty": "Name is required.",
      "string.min": "Name must be at least 2 characters long.",
      "string.max": "Name must be at most 50 characters long.",
      "string.pattern.base": "Name contains invalid characters.",
      "any.required": "Name is required.",
    }),
  email: Joi.string()
    .email()
    .required()
    .pattern(getPattern.emailPattern)
    .messages({
      "string.base": "Email must be a string.",
      "string.email": "Email must be a valid email address.",
      "any.required": "Email is required.",
    }),
  countryCode: Joi.string().optional().allow(null, "").messages({
    "string.base": "Country code must be a string.",
  }),
  mobileNo: Joi.string().required().pattern(getPattern.phonePattern).messages({
    "string.pattern.base": `Please enter a valid Mobile No number.`,
    "string.empty": `Phone number cannot be empty`,
    "any.required": `Phone number is required`,
  }),
  dob: Joi.date().required().iso().messages({
    "date.base": "End date must be a valid date",
    "date.format": "End date must be in ISO 8601 format",
  }),
  gender: Joi.string()
    .valid(...Object.values(PmsGender))
    .messages({
      "any.only": `'Gender' must be one of [${Object.values(PmsGender).join(", ")}]`,
    }),
  address1: Joi.string().required().messages({
    "string.base": "Address 1 must be a string.",
  }),
  address2: Joi.string().optional().allow(null, "").messages({
    "string.base": "Address 2 must be a string.",
  }),
  city: Joi.string().optional().allow(null).messages({
    "string.base": "City must be a string.",
  }),
  pinCode: Joi.number()
    .optional()
    .positive()
    .integer()
    .strict()
    .allow(null)
    .messages({
      "number.base": "Pin Code must be a number.",
      "number.integer": "Pin Code must be an integer.",
      "number.positive": "Pin Code must be positive.",
    }),
  lattitudeLongitude: Joi.string().optional().allow(null).messages({
    "string.base": "Lattitude Longitude must be a string.",
  }),
  ghanaCardNo: Joi.string().required().messages({
    "string.base": "Ghana Card Number must be a string.",
  }),
  tinNo: Joi.string().optional().allow(null).messages({
    "string.base": "Tax Number must be a string.",
  }),
  discount: Joi.number().precision(2).optional().allow(null).strict().messages({
    "number.base": "Discount must be a number.",
    "number.precision": "Discount must have at most 2 decimal places.",
  }),
});
export const updateCustomerSchema = commonCustomerSchema.keys({
  id: Joi.number().required().messages({
    "number.base": "ID must be a number",
  }),
});

export const validateCustomer = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = commonCustomerSchema.validate(req.body, {
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

export const validateUpdateSchema = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = updateCustomerSchema.validate(req.body, {
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
