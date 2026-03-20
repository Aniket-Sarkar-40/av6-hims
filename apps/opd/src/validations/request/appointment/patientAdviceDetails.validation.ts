import { CreatePatientAdviceDetailsInput } from "@/types/appointment/patientAdviceDetails.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const createPatientAdviceDetailsSchema =
  Joi.object<CreatePatientAdviceDetailsInput>({
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

    advice: Joi.string()
      .optional()
      .allow(null, "")
      .messages({
        "string.base": generateValidationErrorMessage("STRING", "Advice"),
      }),

    initialComplaint: Joi.string()
      .required()
      .messages({
        "string.base": generateValidationErrorMessage(
          "STRING",
          "Initial Complaint",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Initial Complaint",
        ),
      }),

    referToEmergency: Joi.boolean()
      .optional()
      .default(false)
      .messages({
        "boolean.base": generateValidationErrorMessage(
          "BOOLEAN",
          "Refer to Emergency",
        ),
      }),
    referToAdmission: Joi.boolean()
      .optional()
      .default(false)
      .messages({
        "boolean.base": generateValidationErrorMessage(
          "BOOLEAN",
          "Refer to Admission",
        ),
      }),
    visitComplete: Joi.boolean()
      .optional()
      .default(false)
      .messages({
        "boolean.base": generateValidationErrorMessage(
          "BOOLEAN",
          "Visit Complete",
        ),
      }),
    referToMentalHealth: Joi.boolean()
      .optional()
      .default(false)
      .messages({
        "boolean.base": generateValidationErrorMessage(
          "BOOLEAN",
          "Refer to Mental Health",
        ),
      }),
    referToAntenatalCare: Joi.boolean()
      .optional()
      .default(false)
      .messages({
        "boolean.base": generateValidationErrorMessage(
          "BOOLEAN",
          "Refer to Antenatal Care",
        ),
      }),
    surgeryRequest: Joi.boolean()
      .optional()
      .default(false)
      .messages({
        "boolean.base": generateValidationErrorMessage(
          "BOOLEAN",
          "Surgery Request",
        ),
      }),
    referToOutsideHospital: Joi.boolean()
      .optional()
      .default(false)
      .messages({
        "boolean.base": generateValidationErrorMessage(
          "BOOLEAN",
          "Refer to Outside Hospital",
        ),
      }),
  });

export const validatePatientAdviceDetailsCreate = validationHandler({
  schema: createPatientAdviceDetailsSchema,
});
