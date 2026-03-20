import {
  CreateReferToDoctorInput,
  UpdateReferToDoctorInput,
} from "@/types/appointment/referToDoctor.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { VisitType } from "@repo/db/generated/prisma/client";
import Joi from "joi";

export const CreateReferToDoctorSchema = Joi.object<
  CreateReferToDoctorInput | UpdateReferToDoctorInput
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

  visitType: Joi.string()
    .valid(...Object.values(VisitType))
    .required()
    .strict()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Visit Type"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Department Type",
        Object.values(VisitType).join(", "),
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Visit Type"),
    }),

  description: Joi.string()
    .trim()
    .min(3)
    .max(500)
    .optional()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Description"),
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Description",
        "3",
      ),
      "string.max": generateValidationErrorMessage(
        "STRING_MAX",
        "Description",
        "500",
      ),
    }),

  opdDepartmentId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "OPD Department ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "OPD Department ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "OPD Department ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "OPD Department ID",
      ),
    }),

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
});

export const UpdateReferToDoctorSchema = CreateReferToDoctorSchema.keys({
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

export const validateCreateReferToDoctor = validationHandler({
  schema: CreateReferToDoctorSchema,
});
export const validateUpdateReferToDoctor = validationHandler({
  schema: UpdateReferToDoctorSchema,
});
