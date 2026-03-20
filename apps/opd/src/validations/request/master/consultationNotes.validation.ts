import { CreateOrUpdateConsultationNotes } from "@/types/master/consultationNotes.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const consultationNotesCreateSchema =
  Joi.object<CreateOrUpdateConsultationNotes>({
    consultationName: Joi.string()
      .required()
      .messages({
        "string.base": generateValidationErrorMessage(
          "STRING",
          "Consultation Name",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Consultation Name",
        ),
      }),
  });

export const consultationNotesUpdateSchema = consultationNotesCreateSchema.keys(
  {
    id: Joi.number()
      .integer()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "ID"),
        "number.integer": generateValidationErrorMessage("INTEGER", "ID"),
        "any.required": generateValidationErrorMessage("REQUIRED", "ID"),
      }),
  },
);

// Validation handler for Consultation Notes creation
export const validateConsultationNotesCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = consultationNotesCreateSchema.validate(req.body, {
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

export const validateConsultationNotesUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = consultationNotesUpdateSchema.validate(req.body, {
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
