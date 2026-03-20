import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export enum Type {
  OPD = "OPD",
  IPD = "IPD",
}

export const patientMedicineDetailSchema = Joi.object({
  medId: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Medicine"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Medicine"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Medicine"),
    }),

  morn: Joi.number()
    .integer()
    .optional()
    .allow(null, "")
    .default(0)
    .messages({
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Morning Dose",
      ),
    }),

  aft: Joi.number()
    .integer()
    .optional()
    .allow(null, "")
    .default(0)
    .messages({
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Afternoon Dose",
      ),
    }),

  night: Joi.number()
    .integer()
    .optional()
    .allow(null, "")
    .default(0)
    .messages({
      "number.integer": generateValidationErrorMessage("INTEGER", "Night Dose"),
    }),

  sos: Joi.boolean()
    .default(false)
    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "SOS"),
    }),

  duration: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Duration"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Duration"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Duration"),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Duration",
        "1",
      ),
    }),

  notes: Joi.string()
    .allow(null, "")
    .max(255)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Notes"),
      "string.max": generateValidationErrorMessage("MAX_VALUE", "Notes", "255"),
    }),
}).custom((v, h) =>
  ["morn", "aft", "night"].some((k) => Number(v[k]) > 0)
    ? v
    : h.error("any.custom", {
        message:
          "Please enter at least one dose (morning, afternoon, or night).",
      }),
);

export const createPatientMedicineSchema = Joi.object({
  appointmentId: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Appointment ID"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Appointment ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Appointment ID",
      ),
    }),

  patientId: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Patient ID"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Patient ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Patient ID"),
    }),

  projectType: Joi.string()
    .valid(...Object.values(Type))
    .required()
    .messages({
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Project Type",
        Object.values(Type).join(", "),
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Project Type",
      ),
    }),

  notes: Joi.string()
    .allow(null, "")
    .max(255)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Notes"),
      "string.max": generateValidationErrorMessage("MAX_VALUE", "Notes", "255"),
    }),

  details: Joi.array()
    .items(patientMedicineDetailSchema)
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage("ARRAY", "Details"),
      "array.min": generateValidationErrorMessage("MIN", "Details", "1"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Details"),
    }),
});

const patientMedicineDetailSchemaUpdate = patientMedicineDetailSchema.keys({
  id: Joi.number()
    .integer()
    .optional()
    .allow(null)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Detail ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Detail ID"),
    }),
});

export const updatePatientMedicineSchema = createPatientMedicineSchema.keys({
  id: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Master ID"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Master ID"),
    }),

  details: Joi.array()
    .items(patientMedicineDetailSchemaUpdate)
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage("ARRAY", "Details"),
      "array.min": generateValidationErrorMessage("MIN", "Details", "1"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Details"),
    }),
});

export const validateCreatePatientMedicine = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = createPatientMedicineSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: "Invalid patient medicine data",
        errors: error.details,
      }),
    );
  }
  next();
};

export const validateUpdatePatientMedicine = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = updatePatientMedicineSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: "Invalid update patient medicine data",
        errors: error.details,
      }),
    );
  }
  next();
};

export const searchMedicineSchema = Joi.object({
  ccId: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Collection Center ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Collection Center ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Collection Center ID",
      ),
    }),

  aptId: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Appointment ID"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Appointment ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Appointment ID",
      ),
    }),

  searchText: Joi.string()
    .allow(null, "")
    .trim()
    .min(3)
    .max(100)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Search Text"),
      "string.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Search Text",
        "3",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX_VALUE",
        "Search Text",
        "100",
      ),
    }),
});

export const validateSearchMedicine = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = searchMedicineSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: "Invalid search parameters",
        errors: error.details,
      }),
    );
  }

  next();
};
