import {
  CreateClinicalHistoryInput,
  UpdateClinicalHistoryInput,
} from "@/types/appointment/clinicalHistory.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const CreateClinicalHistorySchema = Joi.object<
  CreateClinicalHistoryInput | UpdateClinicalHistoryInput
>({
  appointmentId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Appointment ID"),
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
  isSulphurDrugs: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": generateValidationErrorMessage(
        "BOOLEAN",
        "Sulphur Drugs",
      ),
    }),
  isCodeine: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Codeine"),
    }),
  isPenicillin: Joi.boolean()
    .optional()

    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Penicillin"),
    }),
  isAspirin: Joi.boolean()
    .optional()

    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Aspirin"),
    }),
  isIbuprofen: Joi.boolean()
    .optional()

    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Ibuprofen"),
    }),
  isIodine: Joi.boolean()
    .optional()

    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Iodine"),
    }),
  allergiesNote: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Allergies Note"),
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Allergies Note",
        "5",
      ),
      "string.max": generateValidationErrorMessage(
        "STRING_MAX",
        "Allergies Note",
        "500",
      ),
    }),

  isDiabetes: Joi.boolean()
    .optional()

    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Diabetes"),
    }),
  isCancer: Joi.boolean()
    .optional()

    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Cancer"),
    }),
  isHypertension: Joi.boolean()
    .optional()

    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Hypertension"),
    }),
  isAsthma: Joi.boolean()
    .optional()

    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Asthma"),
    }),
  isStd: Joi.boolean()
    .optional()

    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "STD"),
    }),
  isUlcer: Joi.boolean()
    .optional()

    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Ulcer"),
    }),
  isG6pdPartialDefect: Joi.boolean()
    .optional()

    .messages({
      "boolean.base": generateValidationErrorMessage(
        "BOOLEAN",
        "G6PD Partial Defect",
      ),
    }),
  isSickleCellDisease: Joi.boolean()
    .optional()

    .messages({
      "boolean.base": generateValidationErrorMessage(
        "BOOLEAN",
        "Sickle Cell Disease",
      ),
    }),
  isOtherDisease: Joi.boolean()
    .optional()

    .messages({
      "boolean.base": generateValidationErrorMessage(
        "BOOLEAN",
        "Other Disease",
      ),
    }),
  otherNote: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Other Note"),
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Other Note",
        "5",
      ),
      "string.max": generateValidationErrorMessage(
        "STRING_MAX",
        "Other Note",
        "500",
      ),
    }),

  isSmoke: Joi.boolean()
    .optional()

    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Smoke"),
    }),
  isDrink: Joi.boolean()
    .optional()

    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Drink"),
    }),
  isSurgery: Joi.boolean()
    .optional()

    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Surgery"),
    }),
  surgeryNote: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .optional()
    .allow(null)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Surgery Note"),
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Surgery Note",
        "5",
      ),
      "string.max": generateValidationErrorMessage(
        "STRING_MAX",
        "Surgery Note",
        "500",
      ),
    }),

  isMedication: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Medication"),
    }),
  medicationNote: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .optional()
    .allow(null)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Medication Note",
      ),
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Medication Note",
        "5",
      ),
      "string.max": generateValidationErrorMessage(
        "STRING_MAX",
        "Medication Note",
        "500",
      ),
    }),

  isPregnant: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Pregnant"),
    }),
  isBreastFeeding: Joi.boolean()
    .optional()
    .messages({
      "boolean.base": generateValidationErrorMessage(
        "BOOLEAN",
        "Breast Feeding",
      ),
    }),
});

export const validateClinicalHistoryCreate = validationHandler({
  schema: CreateClinicalHistorySchema,
});

export const UpdateClinicalHistorySchema = CreateClinicalHistorySchema.keys({
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

export const validateClinicalHistoryUpdate = validationHandler({
  schema: UpdateClinicalHistorySchema,
});
