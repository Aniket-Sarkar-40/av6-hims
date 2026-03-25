import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { ExpenseInput } from "../../../types/consumerConnect/expense.js";
import { getPattern } from "av6-utils";
import { toExpenseEntity } from "@/mapper/consumerConnect/expense.mapper.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";

export const expenseSchema = Joi.object<ExpenseInput>({
  id: Joi.number().integer().positive().optional().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
    "number.positive": "ID must be a positive number",
  }),
  expenseHeadId: Joi.number().integer().positive().required().messages({
    "number.base": "Expense Head ID must be a number",
    "number.integer": "Expense Head ID must be an integer",
    "number.positive": "Expense Head ID must be a positive number",
    "any.required": "Expense Head ID is required",
  }),
  name: Joi.string().min(2).max(255).required().messages({
    "string.base": "Name must be a string",
    "string.max": "Name must not exceed 255 characters",
    "string.min": "Name must be at least 2 characters long",
    "any.required": "Name is required",
  }),
  invoiceNo: Joi.string().min(2).max(50).required().messages({
    "string.base": "Invoice Number must be a string",
    "string.empty": "Invoice Number cannot be empty",
    "string.min": "Invoice Number must be at least 2 characters long",
    "string.max": "Invoice Number must not exceed 50 characters",
    "any.required": "Invoice Number is required",
  }),
  date: Joi.date().allow(null).optional().messages({
    "date.base": "Date must be a valid date",
    "date.empty": "Date cannot be empty",
    "date.format": "Date must be in a valid format (YYYY-MM-DD)",
    "date.isoDate": "Date must be in ISO format (YYYY-MM-DD)",
  }),
  amount: Joi.number().positive().allow(null).optional().messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be a positive number",
  }),
  //   expMethod: Joi.string()
  //     .valid("CASH", "CARD", "ONLINE")
  //     .allow(null)
  //     .optional()
  //     .messages({
  //       "any.only": 'Expense Method must be one of ["CASH", "CARD", "ONLINE"]',
  //     }),
  documents: Joi.string()
    .trim()
    .pattern(getPattern.imagePattern)
    .allow(null)
    .optional()
    .messages({
      "string.base": "Documents must be a string",
    }),
  note: Joi.string().max(500).allow(null).optional().messages({
    "string.base": "Note must be a string",
    "string.max": "Note must not exceed 500 characters",
  }),
  ccId: Joi.number().integer().positive().required().messages({
    "number.base": "Collection Center ID must be a number",
    "number.integer": "Collection Center ID must be an integer",
    "number.positive": "Collection Center ID must be a positive number",
    "any.required": "Collection Center ID is required",
  }),
  isMaster: Joi.string().valid("ML", "CC").allow(null).optional().messages({
    "any.only": 'Master Type must be one of ["ML", "CC"]',
  }),
});

export const validateExpenseSchema = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.body = toExpenseEntity(req.body);
  const { error } = expenseSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    // if (req.file && req.file.path) {
    //   deleteFileIfExists(req.file.path);
    // }
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
