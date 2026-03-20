import {
  DoctorConsultationWithTimeSlotInput,
  WeekIdInput,
} from "@/types/timeSlot/timeSlot.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { ReferredBy, TAX_METHOD } from "@repo/db/generated/prisma/client";
import { ValidationErrorItem } from "av6-core";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const doctorConsultationWithTimeSlotSchema: Joi.ObjectSchema<DoctorConsultationWithTimeSlotInput> =
  Joi.object({
    docId: Joi.number()
      .integer()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Doctor ID"),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Doctor ID",
        ),
        "any.required": generateValidationErrorMessage("REQUIRED", "Doctor ID"),
      }),

    ccId: Joi.number()
      .integer()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "CC ID"),
        "number.integer": generateValidationErrorMessage("INTEGER", "CC ID"),
        "any.required": generateValidationErrorMessage("REQUIRED", "CC ID"),
      }),

    date: Joi.date()
      .iso()
      .required()
      .messages({
        "date.base": generateValidationErrorMessage("DATE", "Date"),
        "date.format": generateValidationErrorMessage("DATE", "Date"),
        "date.iso": generateValidationErrorMessage("DATE", "Date"),
        "any.required": generateValidationErrorMessage("REQUIRED", "Date"),
      }),

    weekId: Joi.number()
      .integer()
      .min(1)
      .max(7)
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Week ID"),
        "number.integer": generateValidationErrorMessage("INTEGER", "Week ID"),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Week ID",
          "1",
        ),
        "number.max": generateValidationErrorMessage(
          "MAX_VALUE",
          "Week ID",
          "7",
        ),
        "any.required": generateValidationErrorMessage("REQUIRED", "Week ID"),
      }),

    patientType: Joi.string()
      .valid(...Object.values(ReferredBy))
      .required()
      .messages({
        "string.base": generateValidationErrorMessage("STRING", "Patient Type"),
        "any.only": generateValidationErrorMessage(
          "VALID_ENUM",
          "Patient Type",
          ...Object.values(ReferredBy),
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Patient Type",
        ),
      }),

    isVIPBooking: Joi.boolean()
      .required()
      .messages({
        "boolean.base": generateValidationErrorMessage(
          "BOOLEAN",
          "Is VIP Booking",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Is VIP Booking",
        ),
      }),

    isSpecialBooking: Joi.boolean()
      .required()
      .messages({
        "boolean.base": generateValidationErrorMessage(
          "BOOLEAN",
          "Is Special Booking",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Is Special Booking",
        ),
      }),

    isFOCConsultation: Joi.boolean()
      .required()
      .messages({
        "boolean.base": generateValidationErrorMessage(
          "BOOLEAN",
          "Is FOC Consultation",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Is FOC Consultation",
        ),
      }),

    insuranceId: Joi.number()
      .integer()
      .optional()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Insurance"),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Insurance",
        ),
      }),

    clientId: Joi.number()
      .integer()
      .optional()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Client"),
        "number.integer": generateValidationErrorMessage("INTEGER", "Client"),
      }),

    taxMethod: Joi.string()
      .valid(...Object.values(TAX_METHOD))
      .optional()
      .allow(null)
      .messages({
        "string.base": generateValidationErrorMessage("STRING", "Tax method"),
        "string.enum": generateValidationErrorMessage(
          "VALID_ENUM",
          "Tax method",
          ...Object.values(TAX_METHOD),
        ),
      }),

    taxValue: Joi.number()
      .min(0)
      .max(100)
      .optional()
      .allow(null)
      .precision(2)
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Tax"),
        "number.min": generateValidationErrorMessage("MIN_VALUE", "Tax", "0"),
        "number.max": generateValidationErrorMessage("MAX_VALUE", "Tax", "100"),
        "number.precision": generateValidationErrorMessage(
          "PRECISION",
          "Tax",
          "2",
        ),
      }),
  })
    .custom((obj, helpers) => {
      if (obj.isVIPBooking === true && obj.isSpecialBooking === true) {
        return helpers.error("any.invalid", {
          message:
            "Invalid booking type — isVIPBooking and isSpecialBooking cannot both be true",
        });
      }
      return obj;
    })
    .messages({
      "any.invalid": generateValidationErrorMessage(
        "INVALID",
        "Booking Type (VIP and Special cannot both be true)",
      ),
    });

export const validateTimeSlot = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = doctorConsultationWithTimeSlotSchema.validate(req.body, {
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

export const weekIdInputSchema = Joi.object<WeekIdInput>({
  docId: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Doctor ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Doctor ID"),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Doctor ID",
        "1",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Doctor ID"),
    }),

  ccId: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "CC ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "CC ID"),
      "number.min": generateValidationErrorMessage("MIN_VALUE", "CC ID", "1"),
      "any.required": generateValidationErrorMessage("REQUIRED", "CC ID"),
    }),
});

export const validateWeekId = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = weekIdInputSchema.validate(req.body, {
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
