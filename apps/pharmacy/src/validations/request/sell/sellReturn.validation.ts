import {
  SellReturnDetailInput,
  SellReturnInput,
} from "@/types/sell/sellReturn.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { joiDecimalFromSettings } from "@/utils/commonCalculation.utils.js";
import {
  BILL_FOR,
  DeliveryType,
  DiscMethod,
  PAYMENT_STATUS,
  PmsPaymentMode,
  RETURN_STS,
  TAX_METHOD,
} from "@repo/db/generated/prisma/enums.js";
import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";

export const sellReturnDetailInputSchema = Joi.object<SellReturnDetailInput>({
  itemId: Joi.number().integer().required().strict().messages({
    "number.base": "Item Id must be a number",
    "number.integer": "Item Id must be an integer",
    "any.required": "Item Id is required",
  }),
  sellDetailsId: Joi.number().integer().required().strict().messages({
    "number.base": "Sell Details Id must be a number",
    "number.integer": "Sell Details Id must be an integer",
    "any.required": "Sell Details Id is required",
  }),
  itemCategoryName: Joi.string().required().messages({
    "string.base": "Item Medicine Category must be a string",
    "any.required": "Item Medicine Category is required",
  }),
  medType: Joi.string().required().messages({
    "string.base": "Medicine Type must be a string",
    "any.required": "Medicine Type is required",
  }),
  medComp: Joi.string().required().messages({
    "string.base": "Medicine Composition must be a string",
    "any.required": "Medicine Composition is required",
  }),
  medUnit: Joi.string().required().messages({
    "string.base": "Medicine Unit must be a string",
    "any.required": "Medicine Unit is required",
  }),
  manufacturer: Joi.string().required().messages({
    "string.base": "Manufacturer must be a string",
    "any.required": "Manufacturer is required",
  }),
  packSize: Joi.string().required().messages({
    "string.base": "Pack size must be a string",
    "any.required": "Pack size is required",
  }),
  drugType: Joi.string().required().messages({
    "string.base": "Drug type must be a string",
    "any.required": "Drug type is required",
  }),
  itemCategoryId: Joi.number().integer().required().strict().messages({
    "number.base": "Item category Id must be a number",
    "number.integer": "Item category Id must be an integer",
    "any.required": "Item category Id is required",
  }),
  medTypeId: Joi.number().integer().required().strict().messages({
    "number.base": "Medicine type Id must be a number",
    "number.integer": "Medicine type Id must be an integer",
    "any.required": "Medicine type Id is required",
  }),
  medCompId: Joi.number().integer().required().strict().messages({
    "number.base": "Medicine composition ID must be a number",
    "number.integer": "Medicine composition ID must be an integer",
    "any.required": "Medicine composition ID is required",
  }),
  medUnitId: Joi.number().integer().required().strict().messages({
    "number.base": "Medicine unit Id must be a number",
    "number.integer": "Medicine unit Id must be an integer",
    "any.required": "Medicine unit Id is required",
  }),
  manufacturerId: Joi.number().integer().required().strict().messages({
    "number.base": "Manufacturer Id must be a number",
    "number.integer": "Manufacturer Id must be an integer",
    "any.required": "Manufacturer Id is required",
  }),
  packSizeId: Joi.number().integer().required().strict().messages({
    "number.base": "Pack size Id must be a number",
    "number.integer": "Pack size Id must be an integer",
    "any.required": "Pack size Id is required",
  }),
  drugTypeId: Joi.number().integer().required().strict().messages({
    "number.base": "Drug type Id must be a number",
    "number.integer": "Drug type Id must be an integer",
    "any.required": "Drug type Id is required",
  }),
  batchNo: Joi.string().required().messages({
    "string.base": "Batch number must be a string",
    "any.required": "Batch number is required",
  }),
  isFoc: Joi.boolean().required().messages({
    "boolean.base": "isFoc must be a boolean",
    "any.required": "isFoc is required",
  }),
  expiryDate: Joi.date().iso().optional().allow(null).messages({
    "date.base": "Expiry date must be a valid date",
  }),

  mrp: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": "MRP must be a number",
    "number.min": "MRP cannot be negative",
    "number.precision": "MRP must have {{#limit}} decimal places",
    "any.required": "MRP is required",
  }),
  quantity: Joi.number().integer().strict().min(0).required().messages({
    "number.min": "Quantity cannot be negative",
    "any.required": "Quantity is required",
  }),

  netAmount: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": "Net amount must be a number",
    "number.min": "Net amount cannot be negative",
    "number.precision": "Net amount must have {{#limit}} decimal places",
    "any.required": "Net amount is required",
  }),
  discountMethod: Joi.string()
    .valid(...Object.values(DiscMethod))
    .required()
    .messages({
      "string.base": "Discount method must be a string",
      "any.only": `Discount method must be one of ${Object.values(
        DiscMethod
      ).join(", ")}`,
      "any.required": "Discount method is required",
    }),

  discount: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Discount must be a number",
    "number.min": "Discount cannot be negative",
    "number.max": "Discount cannot exceed 100",
    "number.precision": "Discount must have {{#limit}} decimal places",
    "any.required": "Discount is required",
  }),

  netDiscount: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": "Net Discount must be a number",
    "number.min": "Net Discount cannot be negative",
    "number.precision": "Net Discount must have {{#limit}} decimal places",
    "any.required": "Net discount is required",
  }),
  taxMethod: Joi.string()
    .valid(...Object.values(TAX_METHOD))
    .required()
    .messages({
      "string.base": "Tax method must be a string",
      "any.only": `Tax method must be one of ${Object.values(TAX_METHOD).join(
        ", "
      )}`,
      "any.required": "Tax method is required",
    }),

  tax: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Tax must be a number",
    "number.min": "Tax cannot be negative",
    "number.max": "Tax cannot exceed 100",
    "number.precision": "Tax must have {{#limit}} decimal places",
    "any.required": "Tax is required",
  }),

  netTax: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": "Net tax must be a number",
    "number.min": "Net tax cannot be negative",
    "number.precision": "Net tax must have {{#limit}} decimal places",
    "any.required": "Net tax is required",
  }),

  totalAmount: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": "Total amount must be a number",
    "number.min": "Total amount cannot be negative",
    "number.precision": "Total amount must have {{#limit}} decimal places",
    "any.required": "Total amount is required",
  }),
  sellQuantity: Joi.number().strict().integer().min(0).required().messages({
    "number.min": "Sell Quantity cannot be negative",
    "any.required": "Sell Quantity is required",
  }),

  coPayAmount: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": "Co-pay amount must be a number",
    "number.min": "Co-pay amount cannot be negative",
    "number.precision": "Co-pay amount must have {{#limit}} decimal places",
    "any.required": "Co-pay amount is required",
  }),

  customerPayAmount: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": "Customer payment amount must be a number",
    "number.min": "Customer payment amount cannot be negative",
    "number.precision":
      "Customer payment amount must have {{#limit}} decimal places",
    "any.required": "Customer payment amount is required",
  }),
});

export const sellReturnInputSchema = Joi.object<SellReturnInput>({
  sellId: Joi.number().integer().strict().required().messages({
    "number.base": "Sell Id must be a number",
    "number.integer": "Sell Id must be an integer",
    "any.required": "Sell Id is required",
  }),

  ccId: Joi.number().integer().strict().required().messages({
    "number.base": "CC Id must be a number",
    "number.integer": "CC Id must be an integer",
    "any.required": "CC Id is required",
  }),

  sellNumber: Joi.string().required().messages({
    "string.base": "Sell number must be a string",
    "any.required": "Sell number is required",
  }),

  staffId: Joi.number().integer().strict().optional().allow(null).messages({
    "number.base": "Staff ID must be a number",
    "number.integer": "Staff ID must be an integer",
  }),
  aptId: Joi.number().integer().optional().allow(null).strict().messages({
    "number.base": "Appointment Id must be a number",
    "number.integer": "Appointment Id must be an integer",
  }),
  aptNo: Joi.string().optional().allow(null).messages({
    "string.base": "Appointment no must be a string",
  }),
  deliveryType: Joi.string()
    .valid(...Object.values(DeliveryType))
    .required()
    .messages({
      "string.base": "Delivery type must be a string",
      "string.enum": `Delivery type must be one of the following: ${Object.values(
        DeliveryType
      ).join(", ")}`,
      "any.required": "Delivery type is required",
    }),
  paymentMode: Joi.string()
    .valid(...Object.values(PmsPaymentMode))
    .optional()
    .allow(null)
    .messages({
      "string.base": "Payment mode must be a string",
      "string.enum": `Payment mode must be one of the following: ${Object.values(
        PmsPaymentMode
      ).join(", ")}`,
    }),
  isHomeDelivery: Joi.boolean().optional().default(false).messages({
    "boolean.base": "Is home delivery must be a boolean",
  }),
  billDate: Joi.date().optional().allow(null).messages({
    "date.base": "Bill date must be a valid date or null",
  }),
  customerId: Joi.number().integer().required().strict().messages({
    "number.base": "Customer Id must be a number",
    "number.integer": "Customer Id must be an integer",
    "any.required": "Customer Id is required",
  }),
  billingFor: Joi.string()
    .valid(...Object.values(BILL_FOR))
    .required()
    .messages({
      "string.base": "Billing for must be a string",
      "string.enum": `Billing for must be one of the following: ${Object.values(
        BILL_FOR
      ).join(", ")}`,
      "any.required": "Billing for is required",
    }),
  insuranceId: Joi.number().integer().optional().allow(null).strict().messages({
    "number.base": "Insurance Id must be a number",
    "number.integer": "Insurance Id must be an integer",
  }),
  corporateClientId: Joi.number()
    .integer()
    .optional()
    .allow(null)
    .strict()
    .messages({
      "number.base": "Corporate Client Id must be a number",
      "number.integer": "Corporate Client Id must be an integer",
    }),
  patientInsuranceId: Joi.number()
    .integer()
    .optional()
    .allow(null)
    .strict()
    .messages({
      "number.base": "Patient Insurance Id must be a number",
      "number.integer": "Patient Insurance Id must be an integer",
    }),
  doctorId: Joi.number().integer().required().strict().messages({
    "number.base": "Doctor Id must be a number",
    "number.integer": "Doctor Id must be an integer",
    "any.required": "Doctor Id is required",
  }),
  netAmount: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
  }).messages({
    "number.base": "Net amount must be a number",
    "number.precision": "Net amount must have {{#limit}} decimal places",
    "any.required": "Net amount is required",
  }),
  discountMethod: Joi.string()
    .valid(...Object.values(DiscMethod))
    .optional()
    .messages({
      "string.base": "Discount method must be a string",
      "string.enum": `Discount method must be one of the following: ${Object.values(
        DiscMethod
      ).join(", ")}`,
    }),
  discount: joiDecimalFromSettings({
    key: "sellPrecision",
    min: 0,
    max: 100,
  }).messages({
    "number.base": "Discount must be a number",
    "number.min": "Discount cannot be less than 0",
    "number.max": "Discount cannot be greater than 100",
    "number.precision": "Discount must have {{#limit}} decimal places",
  }),
  netDiscount: joiDecimalFromSettings({ key: "sellPrecision", min: 0 })
    .optional()
    .allow(null)
    .messages({
      "number.base": "Net discount must be a number",
      "number.precision": "Net discount must have {{#limit}} decimal places",
    }),
  discountNote: Joi.string().optional().allow(null, "").messages({
    "string.base": "Discount note must be a string",
  }),
  taxMethod: Joi.string()
    .valid(...Object.values(TAX_METHOD))
    .required()
    .messages({
      "string.base": "Tax method must be a string",
      "string.enum": `Tax method must be one of the following: ${Object.values(
        TAX_METHOD
      ).join(", ")}`,
      "any.required": "Tax method is required",
    }),
  tax: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
    min: 0,
    max: 100,
  }).messages({
    "number.base": "Tax must be a number",
    "number.min": "Tax cannot be less than 0",
    "number.max": "Tax cannot be greater than 100",
    "number.precision": "Tax must have {{#limit}} decimal places",
    "any.required": "Tax is required",
  }),
  netTax: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
  }).messages({
    "number.base": "Net tax must be a number",
    "number.precision": "Net tax must have {{#limit}} decimal places",
    "any.required": "Net tax is required",
  }),
  totalAmount: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
  }).messages({
    "number.base": "Total amount must be a number",
    "number.precision": "Total amount must have {{#limit}} decimal places",
    "any.required": "Total amount is required",
  }),
  paidAmount: joiDecimalFromSettings({ key: "sellPrecision" })
    .optional()
    .allow(null)
    .messages({
      "number.base": "Paid amount must be a number",
      "number.precision": "Paid amount must have {{#limit}} decimal places",
    }),
  paymentStatus: Joi.string()
    .valid(...Object.values(PAYMENT_STATUS))
    .messages({
      "string.base": "Payment status must be a string",
      "string.enum": `Payment status must be one of the following: ${Object.values(
        PAYMENT_STATUS
      ).join(", ")}`,
    }),
  status: Joi.string()
    .valid(...Object.values(RETURN_STS))
    .messages({
      "string.base": "Status must be a string",
      "string.enum": `Status must be one of the following: ${Object.values(
        RETURN_STS
      ).join(", ")}`,
    }),
  sellReturnDetails: Joi.array()
    .items(sellReturnDetailInputSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "Sell Return details must be an array",
      "array.min": "At least one Sell Return detail is required",
      "any.required": "Sell Return details is required",
    }),
  coPayAmount: joiDecimalFromSettings({
    key: "sellPrecision",
    min: 0,
    required: true,
  }).messages({
    "number.base": "Co-pay amount must be a number",
    "number.min": "Co-pay amount cannot be negative",
    "number.precision": "Co-pay amount must have {{#limit}} decimal places",
    "any.required": "Co-pay amount is required",
  }),
  customerPayAmount: joiDecimalFromSettings({
    key: "sellPrecision",
    min: 0,
    required: true,
  }).messages({
    "number.base": "Customer payment amount must be a number",
    "number.min": "Customer payment amount cannot be negative",
    "number.precision":
      "Customer payment amount must have {{#limit}} decimal places",
    "any.required": "Customer payment amount is required",
  }),
});

export const sellReturnSchemaUpdate = sellReturnInputSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),
  sellReturnDetails: Joi.array().items(
    sellReturnDetailInputSchema.keys({
      id: Joi.number().integer().optional().messages({
        "number.base": "Id must be a number",
        "number.integer": "Id must be an integer",
      }),
    })
  ),
});

export const sellReturnExcelFilterSchema = Joi.object({
  id: Joi.number().integer().positive().optional().messages({
    "number.base": `Id must be a number`,
    "number.integer": `Id must be an integer`,
    "number.positive": `Id must be a positive number`,
  }),

  sellRefNo: Joi.string().optional().messages({
    "string.base": `Sell ref no must be a string`,
  }),

  sellReturnRefNo: Joi.string().optional().messages({
    "string.base": `Sell return ref no must be a string`,
  }),

  branchId: Joi.number().integer().positive().optional().messages({
    "number.base": `Branch id must be a number`,
    "number.integer": `Branch id must be an integer`,
    "number.positive": `Branch id must be a positive number`,
  }),

  staffId: Joi.number().integer().positive().optional().messages({
    "number.base": `Staff id must be a number`,
    "number.integer": `Staff id must be an integer`,
    "number.positive": `Staff id must be a positive number`,
  }),

  DeliveryType: Joi.string()
    .valid(...Object.values(DeliveryType))
    .optional()
    .messages({
      "any.only": `Delivery type must be one of ${Object.values(
        DeliveryType
      ).join(", ")}`,
    }),

  paymentMode: Joi.string()
    .valid(...Object.values(PmsPaymentMode))
    .optional()
    .allow(null)
    .messages({
      "any.only": `Payment mode must be one of ${Object.values(
        PmsPaymentMode
      ).join(", ")}`,
    }),

  isHomeDelivery: Joi.boolean().optional().messages({
    "boolean.base": `Is home delivery must be a boolean`,
  }),

  startDate: Joi.string().isoDate().optional().messages({
    "string.base": `Start date must be a string`,
    "string.isoDate": `Start date must be in ISO 8601 date format (YYYY-MM-DD)`,
  }),

  endDate: Joi.string().isoDate().optional().messages({
    "string.base": `End date must be a string`,
    "string.isoDate": `End date must be in ISO 8601 date format (YYYY-MM-DD)`,
  }),

  customerId: Joi.number().integer().positive().optional().messages({
    "number.base": `Customer id must be a number`,
    "number.integer": `Customer id must be an integer`,
    "number.positive": `Customer id must be a positive number`,
  }),

  billingFor: Joi.string()
    .valid(...Object.values(BILL_FOR))
    .optional()
    .messages({
      "any.only": `Billing for must be one of ${Object.values(BILL_FOR).join(
        ", "
      )}`,
    }),

  doctorId: Joi.number().integer().positive().optional().messages({
    "number.base": `Doctor id must be a number`,
    "number.integer": `Doctor id must be an integer`,
    "number.positive": `Doctor id must be a positive number`,
  }),

  paymentStatus: Joi.string()
    .valid(...Object.values(PAYMENT_STATUS))
    .optional()
    .messages({
      "any.only": `Payment status must be one of ${Object.values(
        PAYMENT_STATUS
      ).join(", ")}`,
    }),

  status: Joi.string()
    .valid(...Object.values(RETURN_STS))
    .optional()
    .messages({
      "any.only": `Status must be one of ${Object.values(RETURN_STS).join(
        ", "
      )}`,
    }),
})
  .strict()
  .unknown(false)
  .messages({
    "object.unknown": `"{{#label}}" is not allowed`,
  });
export const validateSellReturnInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = sellReturnInputSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      })
    );
  }

  next();
};
export const validateSellReturnUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = sellReturnSchemaUpdate.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      })
    );
  }

  next();
};

export const validateSellReturnExcelFilter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = sellReturnExcelFilterSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    const messages = (error.details as ValidationErrorItem[])
      .map((d) => d.message.replace(/['"]/g, ""))
      .join(", ");

    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: messages,
        errors: error.details,
      })
    );
  }

  next();
};
