// src/validations/service/master/incomeHead.validation.ts

import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import {
  CreateIncomeHeadInput,
  UpdateIncomeHeadInput,
} from "@/types/master/incomeHead.js";

/**
 * Joi schema for creating a new IncomeHead.
 * - incomeCategory: required, string, min length 2, max length 255
 * - description: optional, string or null, max length 255
 */
export const incomeHeadCreateSchema = Joi.object<CreateIncomeHeadInput>({
  incomeCategory: Joi.string().min(2).max(255).trim().required().messages({
    "string.base": "Income Category must be a string",
    "string.empty": "Income Category is required",
    "string.min": "Income Category must be at least 2 characters",
    "string.max": "Income Category cannot exceed 255 characters",
    "any.required": "Income Category is required",
  }),

  description: Joi.string()
    .max(255)
    .trim()
    .allow(null, "")
    .optional()
    .messages({
      "string.base": "Description must be a string or null",
      "string.max": "Description cannot exceed 255 characters",
    }),
});

/**
 * Middleware to validate request body against incomeHeadCreateSchema.
 */
export const validateIncomeHeadCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = incomeHeadCreateSchema.validate(req.body, {
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

/**
 * Joi schema for updating an existing IncomeHead.
 * - id: required, integer
 * - incomeCategory: required, string, min length 2, max length 255
 * - description: optional, string or null, max length 255
 */
export const incomeHeadUpdateSchema = Joi.object<UpdateIncomeHeadInput>({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
    "number.positive": "ID must be a positive number",
    "any.required": "ID is required",
  }),

  incomeCategory: Joi.string().min(2).max(255).trim().required().messages({
    "string.base": "Income Category must be a string",
    "string.empty": "Income Category is required",
    "string.min": "Income Category must be at least 2 characters",
    "string.max": "Income Category cannot exceed 255 characters",
    "any.required": "Income Category is required",
  }),

  description: Joi.string()
    .max(255)
    .trim()
    .allow(null, "")
    .optional()
    .messages({
      "string.base": "Description must be a string or null",
      "string.max": "Description cannot exceed 255 characters",
    }),
});

/**
 * Middleware to validate request body against incomeHeadUpdateSchema.
 */
export const validateIncomeHeadUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = incomeHeadUpdateSchema.validate(req.body, {
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
