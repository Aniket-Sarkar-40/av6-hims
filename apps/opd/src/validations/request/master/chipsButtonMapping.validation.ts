import { CreateOrUpdateChipsButtonMapping } from "@/types/master/chipsButtonMapping.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { ValidationErrorItem } from "av6-core";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

// Define base schema
export const chipsButtonMappingBaseSchema = {
  doctorId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Doctor ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Doctor ID"),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Doctor ID",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Doctor ID"),
    }),

  chipsName: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Chips Name"),
      "string.empty": generateValidationErrorMessage("REQUIRED", "Chips Name"),
      "string.min": generateValidationErrorMessage("MIN", "Chips Name", "1"),
      "string.max": generateValidationErrorMessage("MAX", "Chips Name", "255"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Chips Name"),
    }),
};

// Create schema
export const chipsButtonMappingCreateSchema =
  Joi.object<CreateOrUpdateChipsButtonMapping>({
    ...chipsButtonMappingBaseSchema,
  });

// Update schema (with ID)
export const chipsButtonMappingUpdateSchema =
  Joi.object<CreateOrUpdateChipsButtonMapping>({
    id: Joi.number()
      .integer()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "ID"),
        "number.integer": generateValidationErrorMessage("INTEGER", "ID"),
        "any.required": generateValidationErrorMessage("REQUIRED", "ID"),
      }),
    ...chipsButtonMappingBaseSchema,
  });

// Validation handler for creation
export const validateChipsButtonMappingCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = chipsButtonMappingCreateSchema.validate(req.body, {
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
export const validateChipsButtonMappingUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = chipsButtonMappingUpdateSchema.validate(req.body, {
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
