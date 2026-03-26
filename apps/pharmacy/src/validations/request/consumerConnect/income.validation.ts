import { toIncomeEntity } from "@/mapper/consumerConnect/income.mapper.js";
import { deleteFileIfExists } from "@repo/platform/middlewares/imageUpload.middleware.js";
import { CreateIncomeInput } from "@/types/consumerConnect/income.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { getPattern } from "av6-core";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

/**
 * Joi schema for creating a new Income.
 */
export const incomeCreateSchema = Joi.object<CreateIncomeInput>({
  incHeadId: Joi.number().integer().required().strict().messages({
    "number.base": "Income Head ID must be a number",
    "number.max": "Income Head ID cannot exceed 11",
    "any.required": "Income Head ID is required",
  }),

  name: Joi.string().max(50).required().strict().messages({
    "string.base": "Income name must be a string",
    "string.max": "Income name cannot exceed 50 characters",
    "any.required": "Income name is required",
  }),

  invoiceNo: Joi.string().max(200).required().strict().messages({
    "string.base": "Invoice number must be a string",
    "string.empty": "Invoice number is required",
    "any.required": "Invoice number is required",
    "string.max": "Invoice number cannot exceed 200 characters",
  }),

  date: Joi.date().allow(null).optional().strict().messages({
    "date.base": "Date must be a valid date",
  }),

  amount: Joi.number().positive().allow(null).optional().strict().messages({
    "number.base": "Amount must be a number",
  }),

  note: Joi.string().allow(null, "").optional().strict().messages({
    "string.base": "Note must be a string",
  }),

  documents: Joi.string()
    .trim()
    .pattern(getPattern.imagePattern)
    .optional()
    .allow(null)
    .messages({
      "string.base": "Documents must be a string",
    }),
});

export const incomeUpdateSchema = incomeCreateSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),
});

export const validateIncome = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.body = toIncomeEntity(req.body);
  delete req.body.id;

  const { error } = incomeCreateSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    if (req.file && req.file.path) {
      deleteFileIfExists(req.file.path);
    }
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

export const validateUpdateIncome = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.body = toIncomeEntity(req.body);

  const { error } = incomeUpdateSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    if (req.file && req.file.path) {
      deleteFileIfExists(req.file.path);
    }
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
