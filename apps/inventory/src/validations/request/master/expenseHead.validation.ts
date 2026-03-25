import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import {
  createExpenseHeadInput,
  updateExpenseHeadInput,
} from "@/types/master/expenseHead.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";

export const expenseHeadCreateSchema = Joi.object<createExpenseHeadInput>({
  expenseCategory: Joi.string().min(2).max(255).trim().required().messages({
    "string.base": "Expense Category must be a string",
    "string.empty": "Expense Category cannot be empty",
    "string.min": "Expense Category must be at least 2 characters long",
    "string.max": "Expense Category must not exceed 255 characters",
    // "any.required": "Expense Category is required",
  }),
  description: Joi.string()
    .max(255)
    .trim()
    .allow(null, "")
    .optional()
    .messages({
      "string.base": "Description must be a string",
      "string.max": "Description must not exceed 255 characters",
    }),
});

export const expenseHeadUpdateSchema = Joi.object<updateExpenseHeadInput>({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number",
    "number.required": "ID is required",
  }),
  expenseCategory: Joi.string().min(2).max(255).trim().required().messages({
    "string.base": "Expense Category must be a string",
    "string.empty": "Expense Category cannot be empty",
    "string.min": "Expense Category must be at least 2 characters long",
    "string.max": "Expense Category must not exceed 255 characters",
    "any.required": "Expense Category is required",
  }),
  description: Joi.string()
    .max(255)
    .trim()
    .allow(null, "")
    .optional()
    .messages({
      "string.base": "Description must be a string",
      "string.max": "Description must not exceed 255 characters",
    }),
});

export const validateExpenseHeadCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = expenseHeadCreateSchema.validate(req.body, {
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

export const validateExpenseHeadUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = expenseHeadUpdateSchema.validate(req.body, {
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
