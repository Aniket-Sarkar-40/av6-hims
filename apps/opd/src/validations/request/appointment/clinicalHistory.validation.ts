import {
  CreateClinicalHistoryInput,
  UpdateClinicalHistoryInput,
} from "@/types/appointment/clinicalHistory.js";
import {
  boolOptional,
  idRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const CreateClinicalHistorySchema = Joi.object<
  CreateClinicalHistoryInput | UpdateClinicalHistoryInput
>({
  appointmentId: idRequired("Appointment Id"),
  isSulphurDrugs: boolOptional("Is Sulphur Drugs"),
  isCodeine: boolOptional("Is Codeine"),
  isPenicillin: boolOptional("Is Penicillin"),
  isAspirin: boolOptional("Is Aspirin"),
  isIbuprofen: boolOptional("Is Ibuprofen"),
  isIodine: boolOptional("Is Iodine"),
  allergiesNote: strOptional("Allergies Note", 500)
    .min(5)
    .messages({
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Allergies Note",
        "5",
      ),
    }),

  isDiabetes: boolOptional("Is Diabetes"),
  isCancer: boolOptional("Is Cancer"),
  isHypertension: boolOptional("Is Hypertension"),
  isAsthma: boolOptional("Is Asthma"),
  isStd: boolOptional("Is STD"),
  isUlcer: boolOptional("Is Ulcer"),
  isG6pdPartialDefect: boolOptional("Is G6PD Partial Defect"),
  isSickleCellDisease: boolOptional("Is Sickle Cell Disease"),
  isOtherDisease: boolOptional("Is Other Disease"),
  otherNote: strOptional("Other Note", 500)
    .min(5)
    .messages({
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Other Note",
        "5",
      ),
    }),

  isSmoke: boolOptional("Is Smoke"),
  isDrink: boolOptional("Is Drink"),
  isSurgery: boolOptional("Is Surgery"),
  surgeryNote: strOptional("Surgery Note", 500)
    .min(5)
    .messages({
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Surgery Note",
        "5",
      ),
    }),

  isMedication: boolOptional("Is Medication"),
  medicationNote: strOptional("Medication Note", 500)
    .min(5)
    .messages({
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Medication Note",
        "5",
      ),
    }),

  isPregnant: boolOptional("Is Pregnant"),
  isBreastFeeding: boolOptional("Is Breast Feeding"),
});

export const validateClinicalHistoryCreate = validationHandler({
  schema: CreateClinicalHistorySchema,
});

export const UpdateClinicalHistorySchema = CreateClinicalHistorySchema.keys({
  id: idRequired("Clinical History Id"),
});

export const validateClinicalHistoryUpdate = validationHandler({
  schema: UpdateClinicalHistorySchema,
});
