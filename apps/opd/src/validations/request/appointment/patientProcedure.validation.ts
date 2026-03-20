import { PatientProcedureDetailsInput } from "@/types/appointment/patientProcedure.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  PercentageOrAmount,
  TAX_METHOD,
} from "@repo/db/generated/prisma/client";
import Joi from "joi";

export const PatientProcedureDetailsCreateSchema =
  Joi.object<PatientProcedureDetailsInput>({
    procedureId: Joi.number()
      .integer()
      .positive()
      .required()
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Procedure ID"),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Procedure ID",
        ),
        "number.positive": generateValidationErrorMessage(
          "POSITIVE",
          "Procedure ID",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Procedure ID",
        ),
      }),

    subtotalAmount: Joi.number()
      .min(0)
      .required()
      .precision(2)
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Procedure Charge",
        ),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Procedure Charge",
          "0",
        ),
        "number.precision": generateValidationErrorMessage(
          "DECIMAL",
          "Procedure Charge",
          "2",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Procedure Charge",
        ),
      }),

    otherChargeAmount: Joi.number()
      .min(0)
      .optional()
      .precision(2)
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Other Charge"),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Other Charge",
          "0",
        ),
        "number.precision": generateValidationErrorMessage(
          "DECIMAL",
          "Other Charge",
          "2",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Other Charge",
        ),
      }),

    coPaymentAmount: Joi.number()
      .min(0)
      .optional()
      .precision(2)
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Co Payment Amount",
        ),
        "number.precision": generateValidationErrorMessage(
          "DECIMAL",
          "Co Payment Amount",
          "2",
        ),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Co Payment Amount",
          "0",
        ),
      }),

    discountMode: Joi.string()
      .valid(...Object.values(PercentageOrAmount))
      .optional()
      .allow(null)
      .messages({
        "string.base": generateValidationErrorMessage(
          "STRING",
          "Discount Mode",
        ),
        "any.only": generateValidationErrorMessage(
          "VALID_ENUM",
          "Discount Mode",
          Object.values(PercentageOrAmount).join(", "),
        ),
      }),

    discountValue: Joi.number()
      .min(0)
      .precision(2)
      .optional()
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Discount Value",
        ),
        "number.precision": generateValidationErrorMessage(
          "DECIMAL",
          "Discount Value",
          "2",
        ),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Discount Value",
          "0",
        ),
      }),

    discountAmount: Joi.number()
      .min(0)
      .precision(2)
      .optional()
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Discount Amount",
        ),
        "number.precision": generateValidationErrorMessage(
          "DECIMAL",
          "Discount Amount",
          "2",
        ),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Discount Amount",
          "0",
        ),
      }),
    taxMethod: Joi.string()
      .valid(...Object.values(TAX_METHOD))
      .optional()
      .allow(null)
      .messages({
        "string.base": generateValidationErrorMessage("STRING", "Tax Method"),
        "any.only": generateValidationErrorMessage(
          "VALID_ENUM",
          "Discount Type",
          Object.values(TAX_METHOD).join(", "),
        ),
      }),

    taxValue: Joi.number()
      .min(0)
      .precision(2)
      .optional()
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Tax Value"),
        "number.precision": generateValidationErrorMessage(
          "DECIMAL",
          "Tax Value",
          "2",
        ),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Tax Value",
          "0",
        ),
      }),

    taxAmount: Joi.number()
      .min(0)
      .precision(2)
      .optional()
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Tax Amount"),
        "number.precision": generateValidationErrorMessage(
          "DECIMAL",
          "Tax Amount",
          "2",
        ),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Tax Amount",
          "0",
        ),
      }),

    grossAmount: Joi.number()
      .min(0)
      .required()
      .precision(2)
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Gross Amount"),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Gross Amount",
          "0",
        ),
        "number.precision": generateValidationErrorMessage(
          "DECIMAL",
          "Gross Amount",
          "2",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Gross Amount",
        ),
      }),

    netAmount: Joi.number()
      .min(0)
      .required()
      .precision(2)
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Net Amount"),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Net Amount",
          "0",
        ),
        "number.precision": generateValidationErrorMessage(
          "DECIMAL",
          "Net Amount",
          "2",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Net Amount",
        ),
      }),
  });

export const PatientProcedureCreateSchema = Joi.object({
  ccId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Collection Center ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Collection Center ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Collection Center ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Collection Center ID",
      ),
    }),
  appointmentId: Joi.number()
    .integer()
    .positive()
    .required()
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

  additionalDiscountMode: Joi.string()
    .valid(...Object.values(PercentageOrAmount))
    .optional()
    .allow(null)
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Additional Discount Mode",
      ),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Additional Discount Type",
        Object.values(PercentageOrAmount).join(", "),
      ),
    }),

  additionalDiscountValue: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Additional Discount Value",
      ),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Additional Discount Value",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Additional Discount Value",
        "2",
      ),
    }),

  subtotalAmount: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Subtotal Amount",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Subtotal Amount",
        "2",
      ),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Subtotal Amount",
        "0",
      ),
    }),

  otherChargeAmount: Joi.number()
    .min(0)
    .required()
    .precision(2)
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Other Charge"),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Other Charge",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Other Charge",
        "2",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Other Charge",
      ),
    }),

  discountTotalAmount: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Discount Total Amount",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Discount Total Amount",
        "2",
      ),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Discount Total Amount",
        "0",
      ),
    }),

  taxAmount: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Tax Amount"),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Tax Amount",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Tax Amount",
        "2",
      ),
    }),

  grossAmount: Joi.number()
    .min(0)
    .required()
    .precision(2)
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Gross Amount"),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Gross Amount",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Gross Amount",
        "2",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Gross Amount",
      ),
    }),

  netAmount: Joi.number()
    .min(0)
    .required()
    .precision(2)
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Net Amount"),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Net Amount",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Net Amount",
        "2",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Net Amount"),
    }),

  coPaymentAmount: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Co Payment Amount",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Co Payment Amount",
        "2",
      ),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Co Payment Amount",
        "0",
      ),
    }),

  patientProcedureDetails: Joi.array()
    .items(PatientProcedureDetailsCreateSchema)
    .min(1)
    .required()
    .unique("procedureId")
    .messages({
      "array.base": generateValidationErrorMessage(
        "ARRAY",
        "Patient Procedure Details",
      ),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Patient Procedure Details",
        "1",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Patient Procedure Details",
      ),
      "array.unique": generateValidationErrorMessage("DUPLICATE", "Procedure"),
    }),
});

const PatientProcedureDetailsUpdateSchema =
  PatientProcedureDetailsCreateSchema.keys({
    id: Joi.number()
      .integer()
      .positive()
      .optional()
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Procedure ID"),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Procedure ID",
        ),
        "number.positive": generateValidationErrorMessage(
          "POSITIVE",
          "Procedure ID",
        ),
      }),
  });

export const PatientProcedureUpdateSchema = PatientProcedureCreateSchema.keys({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Patient Procedure ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Patient Procedure ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Patient Procedure ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Patient Procedure ID",
      ),
    }),
  patientProcedureDetails: Joi.array()
    .items(PatientProcedureDetailsUpdateSchema)
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage(
        "ARRAY",
        "Patient Procedure Details",
      ),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Patient Procedure Details",
        "1",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Patient Procedure Details",
      ),
    }),
});

export const PatientProcedureReturnSchema = Joi.object({
  ccId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "CC Id"),
      "number.integer": generateValidationErrorMessage("INTEGER", "CC Id"),
      "number.positive": generateValidationErrorMessage("POSITIVE", "CId"),
      "any.required": generateValidationErrorMessage("REQUIRED", "CC  Id"),
    }),
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Patient Procedure ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Patient Procedure ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Patient Procedure ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Patient Procedure ID",
      ),
    }),
  detailId: Joi.array()
    .items(
      Joi.number()
        .integer()
        .positive()
        .required()
        .strict()
        .messages({
          "number.base": generateValidationErrorMessage(
            "NUMBER",
            "Procedure Details ID",
          ),
          "number.integer": generateValidationErrorMessage(
            "INTEGER",
            "Procedure Details ID",
          ),
          "number.positive": generateValidationErrorMessage(
            "POSITIVE",
            "Procedure Details ID",
          ),
          "any.required": generateValidationErrorMessage(
            "REQUIRED",
            "Procedure Details ID",
          ),
        }),
    )
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage(
        "ARRAY",
        "Procedure Details ID",
      ),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Procedure Details ID",
        "1",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Procedure Details ID",
      ),
    }),
});
export const validateCreatePatientProcedure = validationHandler({
  schema: PatientProcedureCreateSchema,
});
export const validateUpdatePatientProcedure = validationHandler({
  schema: PatientProcedureUpdateSchema,
});
export const validateReturnPatientProcedure = validationHandler({
  schema: PatientProcedureReturnSchema,
});
