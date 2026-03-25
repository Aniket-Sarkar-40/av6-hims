import {
  BILL_FOR,
  DeliveryType,
  DiscMethod,
  PAYMENT_STATUS,
  PaymentMode,
  SELL_STATUS,
  TAX_METHOD,
} from "@repo/db/generated/prisma/enums.js";
import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";
import {
  PaymentMethods,
  SellDetailInput,
  SellInput,
  SellPaymentInput,
  SellStockAdjustmentInput,
} from "../../../types/sell/sell.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { joiDecimalFromSettings } from "@/utils/commonCalculation.utils.js";

export const sellDetailInputSchema = Joi.object<SellDetailInput>({
  id: Joi.number().integer().optional().strict().messages({
    "number.base": "Item ID must be a number",
    "number.integer": "Item ID must be an integer",
  }),
  itemId: Joi.number().integer().required().strict().messages({
    "number.base": "Item ID must be a number",
    "number.integer": "Item ID must be an integer",
    "any.required": "Item ID is required",
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
    "number.base": "Item category ID must be a number",
    "number.integer": "Item category ID must be an integer",
    "any.required": "Item category ID is required",
  }),
  medTypeId: Joi.number().integer().required().strict().messages({
    "number.base": "Medicine type ID must be a number",
    "number.integer": "Medicine type ID must be an integer",
    "any.required": "Medicine type ID is required",
  }),
  medCompId: Joi.number().integer().required().strict().messages({
    "number.base": "Medicine composition ID must be a number",
    "number.integer": "Medicine composition ID must be an integer",
    "any.required": "Medicine composition ID is required",
  }),
  medUnitId: Joi.number().integer().required().strict().messages({
    "number.base": "Medicine unit ID must be a number",
    "number.integer": "Medicine unit ID must be an integer",
    "any.required": "Medicine unit ID is required",
  }),
  manufacturerId: Joi.number().integer().required().strict().messages({
    "number.base": "Manufacturer ID must be a number",
    "number.integer": "Manufacturer ID must be an integer",
    "any.required": "Manufacturer ID is required",
  }),
  packSizeId: Joi.number().integer().required().strict().messages({
    "number.base": "Pack size ID must be a number",
    "number.integer": "Pack size ID must be an integer",
    "any.required": "Pack size ID is required",
  }),
  drugTypeId: Joi.number().integer().required().strict().messages({
    "number.base": "Drug type ID must be a number",
    "number.integer": "Drug type ID must be an integer",
    "any.required": "Drug type ID is required",
  }),
  batchNo: Joi.string().required().messages({
    "string.base": "Batch number must be a string",
    "any.required": "Batch number is required",
  }),
  isFoc: Joi.boolean().required().messages({
    "boolean.base": "isFoc must be a boolean",
    "any.required": "isFoc is required",
  }),
  expiryDate: Joi.date().iso().min("now").optional().allow(null).messages({
    "date.base": "Expiry date must be a valid date",
    "date.min": "Expiry date cannot be in the past",
  }),
  mrp: joiDecimalFromSettings({
    key: "sellPrecision",
    min: 0,
    required: true,
  }).messages({
    "number.base": "MRP must be a number",
    "number.min": "MRP must not be negative",
    "number.max": "MRP must not exceed allowed value",
    "number.precision": "MRP must have {{#limit}} decimal places",
    "any.required": "MRP is required",
  }),
  quantity: Joi.number().integer().positive().required().messages({
    "number.base": "Quantity must be a positive number",
    "number.positive": "Quantity must be a positive number",
    "any.required": "Quantity is required",
  }),

  netAmount: joiDecimalFromSettings({
    key: "sellPrecision",
    min: 0,
    required: true,
  }).messages({
    "number.base": "Net amount must be a number",
    "number.min": "Net amount must not be negative",
    "number.max": "Net amount must not exceed allowed value",
    "number.precision": "Net amount must have {{#limit}} decimal places",
    "any.required": "Net amount is required",
  }),
  discountMethod: Joi.string()
    .valid(...Object.values(DiscMethod))
    .required()
    .messages({
      "string.base": "Discount method must be a string",
      "any.only": `Discount method must be one of ${Object.values(DiscMethod).join(", ")}`,
      "any.required": "Discount method is required",
    }),
  discount: joiDecimalFromSettings({
    key: "sellPrecision",
    max: 100,
    min: 0,
    required: true,
  }).messages({
    "number.base": "Discount must be a positive number",
    "number.min": "Discount cannot be less than 0",
    "number.max": "Discount cannot be greater than 100",
    "number.precision": "Discount must have {{#limit}} decimal places",
    "any.required": "Discount is required",
  }),
  netDiscount: joiDecimalFromSettings({
    key: "sellPrecision",
    min: 0,
    required: true,
  }).messages({
    "number.base": "Net discount must be a number",
    "number.min": "Net discount must not be negative",
    "number.max": "Net discount must not exceed allowed value",
    "number.precision": "Net discount must have {{#limit}} decimal places",
    "any.required": "Net discount is required",
  }),
  taxMethod: Joi.string()
    .valid(...Object.values(TAX_METHOD))
    .required()
    .messages({
      "string.base": "Tax method must be a string",
      "any.only": `Tax method must be one of ${Object.values(TAX_METHOD).join(", ")}`,
      "any.required": "Tax method is required",
    }),
  tax: joiDecimalFromSettings({
    key: "sellPrecision",
    max: 100,
    min: 0,
    required: true,
  }).messages({
    "number.base": "Tax must be a number",
    "number.min": "Tax cannot be less than 0",
    "number.max": "Tax cannot be greater than 100",
    "number.precision": "Tax must have {{#limit}} decimal places",
    "any.required": "Tax is required",
  }),
  netTax: Joi.number().min(0).required().messages({
    "number.base": "Net tax must be a positive number",
    "number.positive": "Net tax must be a positive number",
    "any.required": "Net tax is required",
  }),
  totalAmount: joiDecimalFromSettings({
    key: "sellPrecision",
    min: 0,
    required: true,
  }).messages({
    "number.base": "Total amount must be a number",
    "number.min": "Total amount must not be negative",
    "number.max": "Total amount must not exceed allowed value",
    "number.precision": "Total amount must have {{#limit}} decimal places",
    "any.required": "Total amount is required",
  }),
  coPayAmount: joiDecimalFromSettings({
    key: "sellPrecision",
    min: 0,
    required: true,
  }).messages({
    "number.base": "Co-pay amount must be a number",
    "number.min": "Co-pay amount cannot be negative",
    "number.max": "Co-pay amount must not exceed allowed value",
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
    "number.max": "Customer payment amount must not exceed allowed value",
    "number.precision":
      "Customer payment amount must have {{#limit}} decimal places",
    "any.required": "Customer payment amount is required",
  }),
});

export const sellInputSchema = Joi.object<SellInput>({
  ccId: Joi.number().integer().strict().required().messages({
    "number.base": "CC Id must be a number",
    "number.integer": "CC Id must be an integer",
    "any.required": "CC Id is required",
  }),
  staffId: Joi.number().integer().optional().allow(null).messages({
    "number.base": "Staff Id must be a number",
    "number.integer": "Staff Id must be an integer",
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
      "string.enum": `Delivery type must be one of the following: ${Object.values(DeliveryType).join(", ")}`,
      "any.required": "Delivery type is required",
    }),
  paymentMode: Joi.string()
    .valid(...Object.values(PaymentMode))
    .optional()
    .messages({
      "string.base": "Payment mode must be a string",
      "string.enum": `Payment mode must be one of the following: ${Object.values(PaymentMode).join(", ")}`,
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
      "string.enum": `Billing for must be one of the following: ${Object.values(BILL_FOR).join(", ")}`,
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
      "string.enum": `Discount method must be one of the following: ${Object.values(DiscMethod).join(", ")}`,
    }),
  discount: joiDecimalFromSettings({
    key: "sellPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Discount must be a number",
    "number.min": "Discount cannot be less than 0",
    "number.max": "Discount cannot be greater than 100",
    "number.precision": "Discount must have {{#limit}} decimal places",
  }),
  netDiscount: joiDecimalFromSettings({
    key: "sellPrecision",
    min: 0,
  }).messages({
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
      "string.enum": `Tax method must be one of the following: ${Object.values(TAX_METHOD).join(", ")}`,
      "any.required": "Tax method is required",
    }),
  tax: joiDecimalFromSettings({
    key: "sellPrecision",
    max: 100,
    min: 0,
    required: true,
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
      "string.enum": `Payment status must be one of the following: ${Object.values(PAYMENT_STATUS).join(", ")}`,
    }),
  status: Joi.string()
    .valid(...Object.values(SELL_STATUS))
    .messages({
      "string.base": "Status must be a string",
      "string.enum": `Status must be one of the following: ${Object.values(SELL_STATUS).join(", ")}`,
    }),
  sellDetails: Joi.array()
    .items(sellDetailInputSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "Sell details must be an array",
      "array.min": "At least one sell detail is required",
      "any.required": "Sell details is required",
    }),
  isPrint: Joi.boolean().optional().messages({
    "boolean.base": "Is print must be a boolean",
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

export const sellUpdateSchema = sellInputSchema.keys({
  id: Joi.number().integer().required().strict().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
    "any.required": "ID is required",
  }),
});
export const sellExcelFilterSchema = Joi.object({
  id: Joi.number().integer().positive().optional().messages({
    "number.base": `Id must be a number`,
    "number.integer": `Id must be an integer`,
    "number.positive": `Id must be a positive number`,
  }),

  sellRefNo: Joi.string().optional().messages({
    "string.base": `Sell ref no must be a string`,
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
      "any.only": `Delivery type must be one of ${Object.values(DeliveryType).join(", ")}`,
    }),
  paymentMode: Joi.string()
    .valid(...Object.values(PaymentMode))
    .optional()
    .messages({
      "any.only": `Payment mode must be one of ${Object.values(PaymentMode).join(", ")}`,
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
      "any.only": `Billing for must be one of ${Object.values(BILL_FOR).join(", ")}`,
    }),
  doctorId: Joi.number().integer().positive().optional().messages({
    "number.base": `Doctor id must be a number`,
    "number.integer": `Doctor id must be an integer`,
    "number.positive": `Doctor id must be a positive number`,
  }),
})

  .strict() // no type coercion
  .unknown(false) // disallow unknown keys
  .messages({
    "object.unknown": `"{{#label}}" is not allowed`,
  });

export const validateSellInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = sellInputSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      }),
    );
  }

  next();
};

export const validateSellUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = sellUpdateSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      }),
    );
  }

  next();
};

export const validateExcelFilterSell = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = sellExcelFilterSchema.validate(req.body, {
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
      }),
    );
  }

  next();
};

export const sellStockAdjustmentInputSchema =
  Joi.object<SellStockAdjustmentInput>({
    id: Joi.number().required().strict().messages({
      "number.base": "ID must be a number",
      "any.required": "ID is required",
    }),
    type: Joi.string().valid("SELL").required().messages({
      "string.base": "Type must be a string",
      "any.required": "Type is required",
      "any.only": `Type must be one of the following: SELL`,
    }),
  });

export const validateSellStockAdjustmentInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = sellStockAdjustmentInputSchema.validate(req.body, {
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
      }),
    );
  }

  next();
};

export const paymentMethodItemSchema = Joi.object<PaymentMethods>({
  method: Joi.string()
    .valid("Cash", "Card", "Online", "Cheque")
    .required()
    .messages({
      "any.only": "Method must be one of 'Cash', 'Card', 'Online', 'Cheque'",
      "any.required": "Method is required",
    }),
  paidAmount: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
    min: 0,
  })
    .positive()
    .messages({
      "number.base": "Paid amount must be a number",
      "number.positive": "Paid amount must be greater than 0",
      "number.precision": "Paid amount must have {{#limit}} decimal places",
      "any.required": "Paid amount is required",
    }),
  paymentHeadId: Joi.alternatives().conditional("method", {
    is: "Cash",
    then: Joi.valid(null).messages({
      "any.only": "Payment head ID must be null when method is Cash",
    }),
    otherwise: Joi.number().integer().positive().required().strict().messages({
      "number.base": "Payment head ID must be a number",
      "number.integer": "Payment head ID must be an integer",
      "number.positive": "Payment head ID must be a positive number",
      "any.required": "Payment head ID is required when method is not Cash",
    }),
  }),
  cardHolderName: Joi.alternatives().conditional("method", {
    is: "Card",
    then: Joi.string().min(1).required().messages({
      "any.required": "Card holder name is required when method is Card",
      "string.empty": "Card holder name cannot be empty when method is Card",
    }),
    otherwise: Joi.string().allow("").messages({
      "string.base": "Card holder name must be a string",
    }),
  }),
  cardNo: Joi.alternatives().conditional("method", {
    is: "Card",
    then: Joi.string().min(1).required().messages({
      "any.required": "Card number is required when method is Card",
      "string.empty": "Card number cannot be empty when method is Card",
    }),
    otherwise: Joi.string().allow("").messages({
      "string.base": "Card number must be a string",
    }),
  }),
  expiry: Joi.alternatives().conditional("method", {
    is: "Card",
    then: Joi.string().min(1).required().messages({
      "any.required": "Expiry is required when method is Card",
      "string.empty": "Expiry cannot be empty when method is Card",
    }),
    otherwise: Joi.string().allow("").messages({
      "string.base": "Expiry must be a string",
    }),
  }),
  bankName: Joi.alternatives().conditional("method", {
    is: "Cheque",
    then: Joi.string().min(1).required().messages({
      "any.required": "Bank name is required when method is Cheque",
      "string.empty": "Bank name cannot be empty when method is Cheque",
    }),
    otherwise: Joi.string().allow("").messages({
      "string.base": "Bank name must be a string",
    }),
  }),
  accountNumber: Joi.alternatives().conditional("method", {
    is: "Cheque",
    then: Joi.string().min(1).required().messages({
      "any.required": "Account number is required when method is Cheque",
      "string.empty": "Account number cannot be empty when method is Cheque",
    }),
    otherwise: Joi.string().allow("").messages({
      "string.base": "Account number must be a string",
    }),
  }),
  transactionId: Joi.alternatives().conditional("method", {
    is: "Online",
    then: Joi.string().min(1).required().messages({
      "any.required": "Transaction ID is required when method is Online",
      "string.empty": "Transaction ID cannot be empty when method is Online",
    }),
    otherwise: Joi.string().allow("").messages({
      "string.base": "Transaction ID must be a string",
    }),
  }),
  onlineMethod: Joi.alternatives().conditional("method", {
    is: "Online",
    then: Joi.number().integer().positive().required().strict().messages({
      "number.base": "Online method must be a number",
      "number.integer": "Online method must be an integer",
      "number.positive": "Online method must be a positive number",
      "any.required": "Online method is required when method is Online",
    }),
    otherwise: Joi.valid(null).messages({
      "any.only": "Online method must be null unless method is Online",
    }),
  }),
});

export const sellPaymentInputSchema = Joi.object<SellPaymentInput>({
  ccId: Joi.number().integer().positive().required().strict().messages({
    "number.base": "Branch ID must be a number",
    "number.integer": "Branch ID must be an integer",
    "number.positive": "Branch ID must be a positive number",
    "any.required": "Branch ID is required",
  }),
  sellId: Joi.number().integer().positive().required().strict().messages({
    "number.base": "Sell ID must be a number",
    "number.integer": "Sell ID must be an integer",
    "number.positive": "Sell ID must be a positive number",
    "any.required": "Sell ID is required",
  }),
  paymentType: Joi.string().valid("payment", "refund").required().messages({
    "any.only": "Payment type must be either 'payment' or 'refund'",
    "any.required": "Payment type is required",
  }),
  totalPaidAmount: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
    min: 0,
  })
    .positive()
    .messages({
      "number.base": "Total paid amount must be a number",
      "number.positive": "Total paid amount must be greater than 0",
      "number.precision":
        "Total paid amount must have {{#limit}} decimal places",
      "any.required": "Total paid amount is required",
    }),
  paymentMethod: Joi.array()
    .items(paymentMethodItemSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "paymentMethod must be an array",
      "array.min": "At least one payment method entry is required",
      "any.required": "paymentMethod is required",
    }),
});

export const validateSellPaymentInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = sellPaymentInputSchema.validate(req.body, {
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
      }),
    );
  }

  next();
};

export const sellCoPaySetInputSchema = Joi.object({
  sellId: Joi.number().integer().positive().required().strict().messages({
    "number.base": "Sell ID must be a number",
    "number.integer": "Sell ID must be an integer",
    "number.positive": "Sell ID must be a positive number",
    "any.required": "Sell ID is required",
  }),

  sellRefNo: Joi.string().trim().required().messages({
    "string.base": "Sell Reference Number must be a string",
    "any.required": "Sell Reference Number is required",
  }),

  sellDetailsId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": "Sell Details ID must be a number",
      "number.integer": "Sell Details ID must be an integer",
      "number.positive": "Sell Details ID must be a positive number",
      "any.required": "Sell Details ID is required",
    }),

  coPayMode: Joi.string().valid("AMOUNT", "PERCENT").required().messages({
    "any.only": "Co-Pay Mode must be either 'AMOUNT' or 'PERCENT'",
    "any.required": "Co-Pay Mode is required",
  }),

  coPayValue: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": "Co-Pay Value must be a number",
    "number.min": "Co-Pay Value cannot be negative",
    "any.required": "Co-Pay Value is required",
  }),
});

export const validateSetSellCoPayInput = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = sellCoPaySetInputSchema.validate(req.body, {
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
      }),
    );
  }

  next();
};
