import { CreateOrUpdateMedicineTab } from "@/types/appointment/medicineTab.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { ValidationErrorItem } from "av6-core";

export const medicineTabCreateSchema = Joi.object<CreateOrUpdateMedicineTab>({
  doctorId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Doctor ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Doctor ID"),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Doctor ID",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Doctor ID"),
    }),

  medTabName: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Medicine Tab Name",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Medicine Tab Name",
        "100",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Medicine Tab Name",
      ),
    }),
});

export const medicineTabUpdateSchema = medicineTabCreateSchema.keys({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "ID"),
      "number.positive": generateValidationErrorMessage("POSITIVE", "ID"),
      "any.required": generateValidationErrorMessage("REQUIRED", "ID"),
    }),
});

export const validateMedicineTabCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = medicineTabCreateSchema.validate(
    req.body as CreateOrUpdateMedicineTab,
    {
      abortEarly: false,
      allowUnknown: false,
    },
  );

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

export const validateMedicineTabUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = medicineTabUpdateSchema.validate(
    req.body as CreateOrUpdateMedicineTab,
    {
      abortEarly: false,
      allowUnknown: false,
    },
  );

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
