import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const medicineTabDetailsItemSchema = Joi.object({
  medId: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Medicine"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Medicine"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Medicine"),
    }),

  morn: Joi.number()
    .integer()
    .optional()
    .allow(null, "")
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
      "number.integer": generateValidationErrorMessage("INTEGER", "Duration"),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Duration",
        "1",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Duration"),
    }),

  notes: Joi.string()
    .max(255)
    .allow(null, "")
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Notes"),
      "string.max": generateValidationErrorMessage("MAX_VALUE", "Notes", "255"),
    }),

  isActive: Joi.boolean()
    .default(true)
    .messages({
      "boolean.base": generateValidationErrorMessage("BOOLEAN", "Is Active"),
    }),
})
  .custom((v, h) => {
    if (!["morn", "aft", "night"].some((key) => Number(v[key]) > 0)) {
      return h.error("any.custom", {
        message: "Please enter at least one dose.",
      });
    }
    return v;
  })
  .messages({
    "any.custom": generateValidationErrorMessage(
      "EMPTY",
      "Dose",
      "Please enter at least one dose",
    ),
  });

export const createMedicineTabDetailsSchema = Joi.object({
  medicineTabId: Joi.number()
    .integer()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Medicine Tab ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Medicine Tab ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Medicine Tab ID",
      ),
    }),

  data: Joi.array()
    .items(medicineTabDetailsItemSchema)
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage("ARRAY", "Data"),
      "array.min": generateValidationErrorMessage("MIN", "Data", "1"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Data"),
    }),
});

export const validateMedicineTabDetailsCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = createMedicineTabDetailsSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: "Invalid medicine tab details data",
        errors: error.details,
      }),
    );
  }

  next();
};

const medicineTabDetailsItemUpdateSchema = medicineTabDetailsItemSchema.keys({
  id: Joi.number()
    .integer()
    .optional()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Detail ID"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Detail ID"),
    }),
});

export const updateMedicineTabDetailsSchema =
  createMedicineTabDetailsSchema.keys({
    data: Joi.array()
      .items(medicineTabDetailsItemUpdateSchema)
      .min(1)
      .required()
      .messages({
        "array.base": generateValidationErrorMessage("ARRAY", "Data"),
        "array.min": generateValidationErrorMessage("MIN", "Data", "1"),
        "any.required": generateValidationErrorMessage("REQUIRED", "Data"),
      }),
  });

export const validateMedicineTabDetailsUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = updateMedicineTabDetailsSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: "Invalid medicine tab details update data",
        errors: error.details,
      }),
    );
  }

  next();
};
