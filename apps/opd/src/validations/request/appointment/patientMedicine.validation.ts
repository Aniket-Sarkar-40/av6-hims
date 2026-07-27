import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  arrayRequired,
  boolOptional,
  enumRequired,
  idOptional,
  idRequired,
  intOptional,
  intRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export enum Type {
  OPD = "OPD",
  IPD = "IPD",
}

export const patientMedicineDetailSchema = Joi.object({
  medId: idRequired("Medicine Id"),

  morn: intOptional("Morning Dose").default(0),

  aft: intOptional("Afternoon Dose").default(0),

  night: intOptional("Night Dose").default(0),

  sos: boolOptional("SOS").default(false),

  duration: intRequired("Duration", 1),

  notes: strOptional("Notes"),
}).custom((v, h) =>
  ["morn", "aft", "night"].some((k) => Number(v[k]) > 0)
    ? v
    : h.error("any.custom", {
        message:
          "Please enter at least one dose (morning, afternoon, or night).",
      }),
);

export const createPatientMedicineSchema = Joi.object({
  appointmentId: idRequired("Appointment Id"),

  patientId: idRequired("Patient Id"),

  projectType: enumRequired("Project Type", Type),

  notes: strOptional("Notes"),

  details: arrayRequired("Details", patientMedicineDetailSchema, 1),
});

const patientMedicineDetailSchemaUpdate = patientMedicineDetailSchema.keys({
  id: idOptional("Patient Medicine Detail Id"),
});

export const updatePatientMedicineSchema = createPatientMedicineSchema.keys({
  id: idRequired("Patient Medicine Id"),

  details: arrayRequired("Details", patientMedicineDetailSchemaUpdate, 1),
});

export const validateCreatePatientMedicine = validationHandler({
  schema: createPatientMedicineSchema,
});

export const validateUpdatePatientMedicine = validationHandler({
  schema: updatePatientMedicineSchema,
});

export const searchMedicineSchema = Joi.object({
  ccId: idRequired("Collection Center Id"),

  aptId: idRequired("Appointment Id"),

  searchText: strOptional("Search Text", 100)
    .min(3)
    .messages({
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Search Text",
        "3",
      ),
    }),
});

export const validateSearchMedicine = validationHandler({
  schema: searchMedicineSchema,
});
