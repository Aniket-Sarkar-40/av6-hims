import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { Printer_Type } from "@repo/db/generated/prisma/enums.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const createPrinterSettingsSchema = Joi.object({
  ccId: Joi.number().required().messages({
    "any.required": "cc id is required",
    "number.base": "cc id must be a number",
  }),
  printerName: Joi.string().required().messages({
    "any.required": "printer name is required",
    "string.base": "printer name must be a string",
    "string.empty": "printer name cannot be empty",
  }),
  printerType: Joi.string()
    .valid(...Object.values(Printer_Type)) // Adjust values as per your Printer_Type enum
    .required()
    .messages({
      "any.only": `printer type must be one of ${Object.values(Printer_Type).join(", ")}.`,
      "any.required": "printer type is required",
      "string.base": "printer type must be a string",
      "string.empty": "printer type cannot be empty",
    }),
  printerWidth: Joi.number().required().messages({
    "any.required": "printer width is required",
    "number.base": "printer width must be a number",
  }),
});

export const updatePrinterSettingsSchema = createPrinterSettingsSchema.keys({
  id: Joi.number().strict().required().messages({
    "any.required": "id is required",
    "number.base": "id must be a number",
  }),
});

export const validatePrinterSettings = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = createPrinterSettingsSchema.validate(req.body, {
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

export const validateUpdatePrinterSettings = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = updatePrinterSettingsSchema.validate(req.body, {
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
