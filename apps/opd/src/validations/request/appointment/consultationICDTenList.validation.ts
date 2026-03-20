import { CreateOrUpdateConsultationICDTenList } from "@/types/appointment/consultationICDTenList.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  CategoryType,
  ConsultationICD10Type,
  StatusOfDiagnosis,
} from "@repo/db/generated/prisma/client";
import Joi from "joi";

export const consultationICDTenListBaseSchema = {
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

  icdTenId: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "ICD10 ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "ICD10 ID"),
      "any.required": generateValidationErrorMessage("REQUIRED", "ICD10 ID"),
    }),

  attendance: Joi.string()
    .max(100)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Attendance"),
      "string.max": generateValidationErrorMessage("MAX", "Attendance", "100"),
    }),

  type: Joi.string()
    .valid(...Object.values(ConsultationICD10Type))
    .optional()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Type"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Type",
        Object.values(ConsultationICD10Type).join(", "),
      ),
    }),

  statusOfDiagnosis: Joi.string()
    .valid(...Object.values(StatusOfDiagnosis))
    .optional()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Status of Diagnosis",
      ),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Status of Diagnosis",
        Object.values(StatusOfDiagnosis).join(", "),
      ),
    }),

  category: Joi.string()
    .valid(...Object.values(CategoryType))
    .optional()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Category"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Category",
        Object.values(CategoryType).join(", "),
      ),
    }),

  adverseEffect: Joi.string()
    .max(150)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Adverse Effect"),
      "string.max": generateValidationErrorMessage(
        "MAX",
        "Adverse Effect",
        "150",
      ),
    }),

  dgrgCode: Joi.string()
    .max(100)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "DGRG Code"),
      "string.max": generateValidationErrorMessage("MAX", "DGRG Code", "100"),
    }),
};

// Create schema
export const consultationICDTenListCreateSchema =
  Joi.object<CreateOrUpdateConsultationICDTenList>({
    ...consultationICDTenListBaseSchema,
  });

export const consultationICDTenListUpdateSchema =
  Joi.object<CreateOrUpdateConsultationICDTenList>({
    id: Joi.number()
      .integer()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "ID"),
        "number.integer": generateValidationErrorMessage("INTEGER", "ID"),
        "any.required": generateValidationErrorMessage("REQUIRED", "ID"),
      }),
    ...consultationICDTenListBaseSchema,
  });

export const validateConsultationICDTenListCreate = validationHandler({
  schema: consultationICDTenListCreateSchema,
});

export const validateConsultationICDTenListUpdate = validationHandler({
  schema: consultationICDTenListUpdateSchema,
});
