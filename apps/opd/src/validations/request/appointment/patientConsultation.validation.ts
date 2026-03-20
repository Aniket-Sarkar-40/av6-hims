import { CreatePatientConsultationInput } from "@/types/appointment/patientConsultation.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const createPatientConsultationSchema =
  Joi.object<CreatePatientConsultationInput>({
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

    bloodPressure: Joi.string()
      .required()
      .messages({
        "string.base": generateValidationErrorMessage(
          "STRING",
          "Blood Pressure",
        ),
        "string.empty": generateValidationErrorMessage(
          "REQUIRED",
          "Blood Pressure",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Blood Pressure",
        ),
      }),

    notes: Joi.string()
      .optional()
      .allow(null, "")
      .messages({
        "string.base": generateValidationErrorMessage("STRING", "Notes"),
        "string.empty": generateValidationErrorMessage("REQUIRED", "Notes"),
        "any.required": generateValidationErrorMessage("REQUIRED", "Notes"),
      }),

    temperature: Joi.number()
      .precision(2)
      .min(0)
      .required()

      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Temperature"),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Temperature",
          "0",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Temperature",
        ),
      }),

    weight: Joi.number()
      .precision(2)
      .min(0)
      .optional()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Weight"),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Weight",
          "0",
        ),
      }),

    spO2: Joi.number()
      .min(0)

      .optional()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "SpO2"),
        "number.min": generateValidationErrorMessage("MIN_VALUE", "SpO2", "0"),
      }),

    pulse: Joi.number()
      .integer()
      .min(0)

      .optional()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Pulse"),
        "number.integer": generateValidationErrorMessage("INTEGER", "Pulse"),
        "number.min": generateValidationErrorMessage("MIN_VALUE", "Pulse", "0"),
      }),

    height: Joi.number()
      .precision(2)
      .min(0)
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Height"),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Height",
          "0",
        ),
        "any.required": generateValidationErrorMessage("REQUIRED", "Height"),
      }),

    bmi: Joi.number()
      .precision(2)
      .min(0)

      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "BMI"),
        "number.min": generateValidationErrorMessage("MIN_VALUE", "BMI", "0"),
        "any.required": generateValidationErrorMessage("REQUIRED", "BMI"),
      }),

    systolicBp: Joi.number()
      .integer()
      .min(0)

      .optional()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Systolic BP"),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Systolic BP",
        ),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Systolic BP",
          "0",
        ),
      }),

    diastolicBp: Joi.number()
      .integer()
      .min(0)

      .optional()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Diastolic BP"),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Diastolic BP",
        ),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Diastolic BP",
          "0",
        ),
      }),

    respiratoryRate: Joi.number()
      .integer()
      .min(0)

      .optional()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Respiratory Rate",
        ),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Respiratory Rate",
        ),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Respiratory Rate",
          "0",
        ),
      }),

    heartRateBpm: Joi.number()
      .integer()
      .min(0)

      .optional()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Heart Rate BPM",
        ),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Heart Rate BPM",
        ),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Heart Rate BPM",
          "0",
        ),
      }),

    urineOutput: Joi.number()
      .precision(2)
      .min(0)
      .optional()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Urine Output"),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Urine Output",
          "0",
        ),
      }),

    bloodSugarF: Joi.number()
      .precision(2)
      .min(0)
      .optional()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Blood Sugar F",
        ),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Blood Sugar F",
          "0",
        ),
      }),

    bloodSugarR: Joi.number()
      .precision(2)
      .min(0)
      .optional()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Blood Sugar R",
        ),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Blood Sugar R",
          "0",
        ),
      }),

    oxygenSupplementation: Joi.number()
      .min(0)
      .optional()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Oxygen Supplementation",
        ),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Oxygen Supplementation",
          "0",
        ),
      }),

    intake: Joi.number()
      .min(0)
      .optional()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Intake"),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Intake",
          "0",
        ),
      }),

    output: Joi.number()
      .min(0)
      .optional()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Output"),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Output",
          "0",
        ),
      }),

    bloodGroup: Joi.string()
      .valid(
        "A_POSITIVE",
        "A_NEGATIVE",
        "B_POSITIVE",
        "B_NEGATIVE",
        "AB_POSITIVE",
        "AB_NEGATIVE",
        "O_POSITIVE",
        "O_NEGATIVE",
      )
      .optional()
      .allow(null)
      .messages({
        "string.base": generateValidationErrorMessage("STRING", "Blood Group"),
        "any.only": generateValidationErrorMessage("INVALID", "Blood Group"),
      }),

    comments: Joi.string()
      .optional()
      .allow(null)
      .messages({
        "string.base": generateValidationErrorMessage("STRING", "Comments"),
      }),

    blood: Joi.string()
      .optional()
      .allow(null)
      .messages({
        "string.base": generateValidationErrorMessage("STRING", "Blood"),
      }),
  });

export const patientConsultationUpdateSchema =
  createPatientConsultationSchema.keys({
    id: Joi.number()
      .integer()
      .required()
      .positive()
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "ID"),
        "number.integer": generateValidationErrorMessage("INTEGER", "ID"),
        "number.positive": generateValidationErrorMessage("POSITIVE", "ID"),
        "any.required": generateValidationErrorMessage("REQUIRED", "ID"),
      }),
  });

export const validatePatientConsultationCreate = validationHandler({
  schema: createPatientConsultationSchema,
});

export const validatePatientConsultationUpdate = validationHandler({
  schema: patientConsultationUpdateSchema,
});
