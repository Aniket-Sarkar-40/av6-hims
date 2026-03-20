// src/validators/opdDepartmentPrefix.validator.ts

import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { ValidationErrorItem } from "av6-core";

// Base schema for both create and update
export const opdDepartmentPrefixBaseSchema = {
  opdDepartmentId: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Opd Department Prefix ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Opd Department Prefix ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Opd Department Prefix ID",
      ),
    }),

  prefix: Joi.string()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Prefix"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Prefix"),
    }),

  licenseType: Joi.string()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "License Type"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "License Type",
      ),
    }),
};

// Schema for creating a new record (no ID)
export const opdDepartmentPrefixCreateSchema = Joi.object({
  ...opdDepartmentPrefixBaseSchema,
});

// Schema for updating an existing record (ID required)
export const opdDepartmentPrefixUpdateSchema = Joi.object({
  id: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "ID"),
      "any.required": generateValidationErrorMessage("REQUIRED", "ID"),
    }),
  ...opdDepartmentPrefixBaseSchema,
});

// Middleware to validate create request
export const validateOpdDepartmentPrefixCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = opdDepartmentPrefixCreateSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    const messages = (error.details as ValidationErrorItem[])
      .map((d) => d.message.replace(/['"]/g, ""))
      .join(", ");

    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: messages,
        errors: error.details,
      }),
    );
  }

  next();
};

// Middleware to validate update request
export const validateOpdDepartmentPrefixUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = opdDepartmentPrefixUpdateSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    const messages = (error.details as ValidationErrorItem[])
      .map((d) => d.message.replace(/['"]/g, ""))
      .join(", ");

    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: messages,
        errors: error.details,
      }),
    );
  }

  next();
};
