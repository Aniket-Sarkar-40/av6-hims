import { BranchReq } from "@/types/master/branch.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { getPattern } from "av6-core";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const branchSchema = Joi.object<BranchReq>({
  id: Joi.number().integer().required().strict().messages({
    "number.base": "Collection Center Id must be a number",
    "number.integer": "Collection Center Id must be an integer",
    "any.required": "Collection Center Id is required",
  }),
  name: Joi.string().required().min(2).messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),
  vatNo: Joi.string().required().messages({
    "string.base": "Vat No must be a string",
    "any.required": "Vat No is required",
  }),
  tinNo: Joi.string().required().messages({
    "string.base": "Tin No must be a string",
    "any.required": "Tin No is required",
  }),
  businessSubline: Joi.string().optional().allow(null, "").messages({
    "string.base": "Business sub line must be a string",
  }),
  pharmacistName: Joi.string().required().messages({
    "string.base": "Pharmacist name must be a string",
    "any.required": "Pharmacist name is required",
  }),
  address: Joi.string().required().messages({
    "string.base": "Address must be a string",
    "any.required": "Address is required",
  }),
  area: Joi.string().optional().allow(null, "").messages({
    "string.base": "Area must be a string",
  }),
  countryCode: Joi.string().optional().allow(null, "").messages({
    "string.base": "Country code must be a string.",
  }),
  phone: Joi.string().required().pattern(getPattern.phonePattern).messages({
    "string.pattern.base": `Please enter a valid Mobile No number.`,
    "string.empty": `Phone number cannot be empty`,
    "any.required": `Phone number is required`,
  }),
  countryId: Joi.number().integer().optional().allow(null).strict().messages({
    "number.base": "Country Id must be a number",
    "number.integer": "Country Id must be an integer",
    "any.required": "Country Id is required",
  }),

  stateId: Joi.number().integer().optional().allow(null).strict().messages({
    "number.base": "State Id must be a number",
    "number.integer": "State Id must be an integer",
    "any.required": "State Id is required",
  }),

  cityId: Joi.number().integer().optional().allow(null).strict().messages({
    "number.base": "City Id must be a number",
    "number.integer": "City Id must be an integer",
    "any.required": "City Id is required",
  }),

  email: Joi.string()
    .email()
    .required()
    .pattern(getPattern.emailPattern)
    .messages({
      "string.base": "Email must be a string",
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
    }),

  pinCode: Joi.number().integer().optional().allow(null).strict().messages({
    "number.base": "Pin code must be a number",
    "number.integer": "Pin code must be an integer",
    "any.required": "Pin code is required",
  }),
  latitudeLongitude: Joi.string().optional().allow(null).messages({
    "string.base": "Latitude and longitude must be a string",
    "any.required": "Latitude and longitude are required",
  }),
  isMain: Joi.boolean().optional().default(false).messages({
    "boolean.base": "Is Main must be a boolean",
  }),
  categories: Joi.array().items(Joi.number()).optional().allow(null).messages({
    "array.base": "Categories must be an array of numbers",
    "number.base": "Each category must be a number",
  }),
  isAutonomous: Joi.boolean().optional().default(false).messages({
    "boolean.base": "Is Autonomous must be a boolean",
  }),
});

export const validateBranch = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = branchSchema.validate(req.body, {
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
