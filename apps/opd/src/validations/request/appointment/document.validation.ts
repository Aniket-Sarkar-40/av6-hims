import { toDocumentEntity } from "@/mapper/appointment/document.mapper.js";
import {
  DocumentMasterEntity,
  DocumentMasterReq,
} from "@/types/appointment/document.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { toRelativeImagePath } from "@repo/shared/utils/helper.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { DocumentName } from "@repo/db/generated/prisma/client";
import { getPattern } from "av6-core";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const documentSchema = Joi.object<DocumentMasterReq>({
  documentType: Joi.string()
    .valid(...Object.values(DocumentName))
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Document Type"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Document Type",
        Object.values(DocumentName).join(", "),
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Document Type",
      ),
    }),

  appointmentId: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Appointment ID"),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Appointment ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Appointment ID",
      ),
    }),
  filePath: Joi.string()
    .required()
    .pattern(new RegExp(getPattern.imageWithOtherPattern))
    .messages({
      "string.pattern.base": generateValidationErrorMessage(
        "INVALID_FILE",
        "File Path",
      ),
      "string.base": generateValidationErrorMessage("STRING", "File Path"),
      "any.required": generateValidationErrorMessage("REQUIRED", "File Path"),
    }),
});
export const validateDocumentCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.file?.path) {
    req.body.filePath = toRelativeImagePath(req.file.path);
  }
  req.body = toDocumentEntity(req.body as DocumentMasterEntity);
  const { error } = documentSchema.validate(req.body, { abortEarly: false });
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
