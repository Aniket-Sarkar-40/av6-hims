import { CreateOrUpdateConsultationNotesMapping } from "@/types/master/consultationNotesMapping.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const consultationNotesMappingCreateSchema =
  Joi.object<CreateOrUpdateConsultationNotesMapping>({
    doctorId: Joi.number()
      .integer()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "ID"),
        "number.integer": generateValidationErrorMessage("INTEGER", "ID"),
        "any.required": generateValidationErrorMessage("REQUIRED", "ID"),
      }),
    consultationNotesId: Joi.array()
      .items(Joi.number())
      .required()
      .messages({
        "array.base": generateValidationErrorMessage(
          "ARRAY",
          "Consultation Notes ID",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Consultation Notes ID",
        ),
      }),
  });

export const consultationNotesMappingUpdateSchema =
  consultationNotesMappingCreateSchema.keys({
    id: Joi.number()
      .integer()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "ID"),
        "number.integer": generateValidationErrorMessage("INTEGER", "ID"),
        "any.required": generateValidationErrorMessage("REQUIRED", "ID"),
      }),
  });

export const validateConsultationNotesMappingCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = consultationNotesMappingCreateSchema.validate(req.body, {
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

export const validateConsultationNotesMappingUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = consultationNotesMappingUpdateSchema.validate(req.body, {
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
