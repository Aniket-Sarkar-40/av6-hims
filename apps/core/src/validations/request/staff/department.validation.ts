import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { getPattern } from "av6-utils";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";

export const departmentSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(getPattern.nameWithNumPattern!)
    .required()
    .messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name must be at most 50 characters long",
      "string.pattern.base": "Name contains invalid characters",
      "any.required": "Name is required",
    }),

  deptId: Joi.string().trim().min(1).max(50).optional().messages({
    "string.base": "Dept Id must be a string",
    "string.empty": "Dept Id is required",
    "string.min": "Dept Id must be at least 1 character long",
    "string.max": "Dept Id must be at most 50 characters long",
    "any.required": "Dept Id is required",
  }),

  deptDisplayText: Joi.string().trim().min(2).max(100).optional().messages({
    "string.base": "Dept display text must be a string",
    "string.empty": "Dept display text is required",
    "string.min": "Dept display text must be at least 2 characters long",
    "string.max": "Dept display text must be at most 100 characters long",
    "any.required": "Dept display text is required",
  }),

  deptSequence: Joi.number().integer().min(0).optional().messages({
    "number.base": "Dept sequence must be a number",
    "number.integer": "Dept sequence must be an integer",
    "number.min": "Dept sequence must be at least 0",
    "any.required": "Dept sequence is required",
  }),

  isSample: Joi.string().valid("0", "1").optional().messages({
    "string.base": "Is Sample must be a string",
    "any.only": 'Is Sample must be one of "0" or "1"',
    "any.required": "Is Sample is required",
  }),

  isAnalyte: Joi.string().valid("0", "1").optional().messages({
    "string.base": "Is Analyze must be a string",
    "any.only": 'Is Analyze must be one of "0" or "1"',
  }),

  masterDept: Joi.number().integer().min(0).optional().messages({
    "number.base": "Master Dept must be a number",
    "number.integer": "Master Dept must be an integer",
    "number.min": "Master Dept must be at least 0",
    "any.required": "Master Dept is required",
  }),

  tatData: Joi.string().optional().messages({
    "string.base": "Tat Data must be a string",
  }),

  printInTrs: Joi.string().valid("yes", "no").optional().messages({
    "string.base": "Print In Trs must be a string",
    "any.only": 'Print In Trs must be one of "yes" or "no"',
  }),

  isActive: Joi.string()
    .trim()
    .lowercase() // transform any casing to lowercase
    .valid("yes", "no") // validate against your Prisma enum values
    .optional()
    .messages({
      "string.base": "Is Active must be a string",
      "any.only": 'Is Active must be one of "yes" or "no"',
      "any.required": "Is Active is required",
    }),

  designation: Joi.string().optional().messages({
    "string.base": "Designation must be a string",
  }),
});
export const validateDepartment = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = departmentSchema.validate(req.body, { abortEarly: false });

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
