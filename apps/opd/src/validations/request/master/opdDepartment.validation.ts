import { CreateOrUpdateOpdDepartment } from "@/types/master/opdDepartment.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { DepartmentType } from "@repo/db/generated/prisma/client";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { ValidationErrorItem } from "av6-core";

// Define base schema
export const opdDepartmentBaseSchema = {
  departmentType: Joi.string()
    .valid(...Object.values(DepartmentType))
    .required()
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Department Type",
      ),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Department Type",
        Object.values(DepartmentType).join(", "),
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Department Type",
      ),
    }),

  departmentName: Joi.string()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Department Name",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Department Name",
      ),
    }),
};

// Create schema
export const opdDepartmentCreateSchema =
  Joi.object<CreateOrUpdateOpdDepartment>({
    ...opdDepartmentBaseSchema,
  });

// Update schema (with ID)
export const opdDepartmentUpdateSchema =
  Joi.object<CreateOrUpdateOpdDepartment>({
    id: Joi.number()
      .integer()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "ID"),
        "number.integer": generateValidationErrorMessage("INTEGER", "ID"),
        "any.required": generateValidationErrorMessage("REQUIRED", "ID"),
      }),
    ...opdDepartmentBaseSchema,
  });

// Validation handler for creation
export const validateOpdDepartmentCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = opdDepartmentCreateSchema.validate(req.body, {
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

// Validation handler for update
export const validateOpdDepartmentUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = opdDepartmentUpdateSchema.validate(req.body, {
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
