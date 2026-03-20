import {
  GeneralBillingCreateInput,
  GeneralBillingDetailsInput,
} from "@/types/appointment/generalBilling.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  PercentageOrAmount,
  TAX_METHOD,
} from "@repo/db/generated/prisma/client";
import Joi from "joi";

export const GeneralBillingDetailsCreateSchema =
  Joi.object<GeneralBillingDetailsInput>({
    generalBillItemId: Joi.number()
      .integer()
      .positive()
      .required()
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "General Bill Item ID",
        ),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "General Bill Item ID",
        ),
        "number.positive": generateValidationErrorMessage(
          "POSITIVE",
          "General Bill Item ID",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "General Bill Item ID",
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
          "Subtotal Amount",
        ),
        "number.min": generateValidationErrorMessage(
          "MIN_VALUE",
          "Subtotal Amount",
          "0",
        ),
        "number.precision": generateValidationErrorMessage(
          "DECIMAL",
          "Subtotal Amount",
          "2",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Subtotal Amount",
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
          "Tax Method",
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

    isFoc: Joi.boolean()
      .required()
      .messages({
        "boolean.base": generateValidationErrorMessage("BOOLEAN", "Is FOC"),
        "any.required": generateValidationErrorMessage("REQUIRED", "Is FOC"),
      }),
  });

export const GeneralBillingCreateSchema = Joi.object<GeneralBillingCreateInput>(
  {
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

    patientId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Patient ID"),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Patient ID",
        ),
        "number.positive": generateValidationErrorMessage(
          "POSITIVE",
          "Patient ID",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Patient ID",
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
          "Additional Discount Mode",
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
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Net Amount",
        ),
      }),

    generalBillingDetails: Joi.array()
      .items(GeneralBillingDetailsCreateSchema)
      .min(1)
      .required()
      .messages({
        "array.base": generateValidationErrorMessage(
          "ARRAY",
          "General Billing Details",
        ),
        "array.min": generateValidationErrorMessage(
          "ARRAY_MIN_LENGTH",
          "General Billing Details",
          "1",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "General Billing Details",
        ),
        "array.unique": generateValidationErrorMessage(
          "DUPLICATE",
          "General Bill Item",
        ),
      }),
  },
);

const GeneralBillingDetailsUpdateSchema =
  GeneralBillingDetailsCreateSchema.keys({
    id: Joi.number()
      .integer()
      .positive()
      .optional()
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "General Billing Details ID",
        ),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "General Billing Details ID",
        ),
        "number.positive": generateValidationErrorMessage(
          "POSITIVE",
          "General Billing Details ID",
        ),
      }),
  });

export const GeneralBillingUpdateSchema = GeneralBillingCreateSchema.keys({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "General Billing ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "General Billing ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "General Billing ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "General Billing ID",
      ),
    }),
  generalBillingDetails: Joi.array()
    .items(GeneralBillingDetailsUpdateSchema)
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage(
        "ARRAY",
        "General Billing Details",
      ),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "General Billing Details",
        "1",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "General Billing Details",
      ),
    }),
});

export const GeneralBillingReturnSchema = Joi.object({
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
        "General Billing ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "General Billing ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "General Billing ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "General Billing ID",
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
            "General Billing Details ID",
          ),
          "number.integer": generateValidationErrorMessage(
            "INTEGER",
            "General Billing Details ID",
          ),
          "number.positive": generateValidationErrorMessage(
            "POSITIVE",
            "General Billing Details ID",
          ),
          "any.required": generateValidationErrorMessage(
            "REQUIRED",
            "General Billing Details ID",
          ),
        }),
    )
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage(
        "ARRAY",
        "General Billing Details ID",
      ),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "General Billing Details ID",
        "1",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "General Billing Details ID",
      ),
    }),
});
export const validateCreateGeneralBilling = validationHandler({
  schema: GeneralBillingCreateSchema,
});
export const validateUpdateGeneralBilling = validationHandler({
  schema: GeneralBillingUpdateSchema,
});
export const validateReturnGeneralBilling = validationHandler({
  schema: GeneralBillingReturnSchema,
});
