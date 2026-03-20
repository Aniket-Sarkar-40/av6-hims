import { CreateConsultationComplaintsInput } from "@/types/appointment/consultationComplaint.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const createConsultationComplaintsSchema =
  Joi.object<CreateConsultationComplaintsInput>({
    complaint: Joi.array()
      .items(
        Joi.string()
          .trim()
          .max(255)
          .required()
          .messages({
            "string.base": generateValidationErrorMessage(
              "STRING",
              "Complaint",
            ),
            "string.empty": generateValidationErrorMessage(
              "REQUIRED",
              "Complaint",
            ),
            "string.max": generateValidationErrorMessage(
              "STRING_MAX",
              "Complaint",
              "255",
            ),
          }),
      )
      .min(1)
      .unique((a, b) => a.trim().toLowerCase() === b.trim().toLowerCase())
      .required()
      .messages({
        "array.base": generateValidationErrorMessage("ARRAY", "Complaints"),
        "array.min": generateValidationErrorMessage(
          "ARRAY_MIN_LENGTH",
          "Complaints",
          "1",
        ),
        "array.unique": generateValidationErrorMessage("UNIQUE", "Complaints"),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Complaints",
        ),
      }),

    appointmentId: Joi.number()
      .integer()
      .positive()
      .required()
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Appointment ID",
        ),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Appointment ID",
        ),
        "number.positive": generateValidationErrorMessage(
          "POSITIVE",
          "Appointment ID",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Appointment ID",
        ),
      }),
  });

export const validateConsultationComplaintsCreate = validationHandler({
  schema: createConsultationComplaintsSchema,
});
