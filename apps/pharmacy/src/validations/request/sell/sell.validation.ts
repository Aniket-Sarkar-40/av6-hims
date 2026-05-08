import {
  BILL_FOR,
  DeliveryType,
  DiscMethod,
  PAYMENT_STATUS,
  PmsPaymentMode,
  SELL_STATUS,
  TAX_METHOD,
} from "@repo/db/generated/prisma/enums.js";
import Joi from "joi";
import { joiDecimalFromSettings } from "@/utils/commonCalculation.utils.js";
import {
  arrayRequired,
  boolOptional,
  boolRequired,
  dateOptional,
  enumOptional,
  enumRequired,
  idOptional,
  idRequired,
  intRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import {
  PaymentMethods,
  SellDetailInput,
  SellInput,
  SellPaymentInput,
  SellStockAdjustmentInput,
} from "@/types/sell/sell.js";

export const sellDetailInputSchema = Joi.object<SellDetailInput>({
  id: idOptional("Id"),
  itemId: idRequired("Item Id"),
  itemCategoryName: strRequired("Item Category Name"),
  medType: strRequired("Medicine Type"),
  medComp: strRequired("Medicine composition"),
  medUnit: strRequired("Medicine unit"),
  manufacturer: strRequired("Manufacturer"),
  packSize: strRequired("Pack size"),
  drugType: strRequired("Drug Type"),
  itemCategoryId: idRequired("Item Category Id"),
  medTypeId: idRequired("Medicine Type Id"),
  medCompId: idRequired("Medicine composition Id"),
  medUnitId: idRequired("Medicine unit Id"),
  manufacturerId: idRequired("Manufacturer Id"),
  packSizeId: idRequired("Pack size Id"),
  drugTypeId: idRequired("Drug Type Id"),
  batchNo: strRequired("Batch No"),
  isFoc: boolRequired("Is Foc"),
  expiryDate: dateOptional("Expiry Date").min("now"),
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
  discountMethod: enumRequired("Discount method", DiscMethod),
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
  taxMethod: enumRequired("Tax method", TAX_METHOD),
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
  netTax: intRequired("Net tax", 0),
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
  ccId: idRequired("CC Id"),
  staffId: idOptional("Staff Id"),
  aptId: idOptional("Apt Id"),
  aptNo: strOptional("Apt No"),
  deliveryType: enumRequired("Delivery type", DeliveryType),
  paymentMode: enumOptional("Payment mode", PmsPaymentMode),
  isHomeDelivery: boolOptional("Is home delivery").default(false),
  billDate: dateOptional("Bill date"),
  customerId: idRequired("Customer Id"),
  billingFor: enumRequired("Billing for", BILL_FOR),
  insuranceId: idOptional("Insurance Id"),
  corporateClientId: idOptional("Corporate Client Id"),
  patientInsuranceId: idOptional("Patient Insurance Id"),
  doctorId: idRequired("Doctor Id"),
  netAmount: joiDecimalFromSettings({
    key: "sellPrecision",
    required: true,
  }).messages({
    "number.base": "Net amount must be a number",
    "number.precision": "Net amount must have {{#limit}} decimal places",
    "any.required": "Net amount is required",
  }),
  discountMethod: enumOptional("Discount method", DiscMethod),
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
  discountNote: strOptional("Discount note"),
  taxMethod: enumRequired("Tax method", TAX_METHOD),
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
  paymentStatus: enumOptional("Payment status", PAYMENT_STATUS),
  status: enumOptional("Status", SELL_STATUS),
  sellDetails: arrayRequired("Sell details", sellDetailInputSchema, 1),
  isPrint: boolOptional("Is Print"),
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
  id: idRequired("Id"),
});
export const sellExcelFilterSchema = Joi.object({
  id: idOptional("Id"),

  sellRefNo: strOptional("Sell Ref No"),

  branchId: idOptional("Branch Id"),
  staffId: idOptional("Staff Id"),
  DeliveryType: enumOptional("Delivery type", DeliveryType),
  paymentMode: enumOptional("Payment mode", PmsPaymentMode),
  isHomeDelivery: boolOptional("Is home delivery"),

  startDate: dateOptional("Start date"),

  endDate: dateOptional("End date"),
  customerId: idOptional("Customer Id"),
  billingFor: enumOptional("Billing for", BILL_FOR),
  doctorId: idOptional("Doctor Id"),
})

  .strict() // no type coercion
  .unknown(false) // disallow unknown keys
  .messages({
    "object.unknown": `"{{#label}}" is not allowed`,
  });

export const validateSellInput = validationHandler({
  schema: sellInputSchema,
});

export const validateSellUpdate = validationHandler({
  schema: sellUpdateSchema,
});

export const validateExcelFilterSell = validationHandler({
  schema: sellExcelFilterSchema,
});

export const sellStockAdjustmentInputSchema =
  Joi.object<SellStockAdjustmentInput>({
    id: idRequired("Id"),
    type: enumRequired("Type", { SELL: "SELL" }),
  });

export const validateSellStockAdjustmentInput = validationHandler({
  schema: sellStockAdjustmentInputSchema,
});

export const paymentMethodItemSchema = Joi.object<PaymentMethods>({
  method: enumRequired("Method", {
    Cash: "Cash",
    Card: "Card",
    Online: "Online",
    Cheque: "Cheque",
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
    otherwise: idRequired("Payment head Id"),
  }),
  cardHolderName: Joi.alternatives().conditional("method", {
    is: "Card",
    then: strRequired("Card holder name", 1),
    otherwise: strOptional("Card holder name"),
  }),
  cardNo: Joi.alternatives().conditional("method", {
    is: "Card",
    then: strRequired("Card number", 1),
    otherwise: strOptional("Card number"),
  }),
  expiry: Joi.alternatives().conditional("method", {
    is: "Card",
    then: strRequired("Expiry", 1),
    otherwise: strOptional("Expiry"),
  }),
  bankName: Joi.alternatives().conditional("method", {
    is: "Cheque",
    then: strRequired("Bank name", 1),
    otherwise: strOptional("Bank name"),
  }),
  accountNumber: Joi.alternatives().conditional("method", {
    is: "Cheque",
    then: strRequired("Account number", 1),
    otherwise: strOptional("Account number"),
  }),
  transactionId: Joi.alternatives().conditional("method", {
    is: "Online",
    then: strRequired("Transaction ID", 1),
    otherwise: strOptional("Transaction ID"),
  }),
  onlineMethod: Joi.alternatives().conditional("method", {
    is: "Online",
    then: intRequired("Online method"),
    otherwise: Joi.valid(null).messages({
      "any.only": "Online method must be null unless method is Online",
    }),
  }),
});

export const sellPaymentInputSchema = Joi.object<SellPaymentInput>({
  ccId: idRequired("CC Id"),
  sellId: idRequired("Sell Id"),
  paymentType: enumRequired("Payment Type", {
    payment: "payment",
    refund: "refund",
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
  paymentMethod: arrayRequired("Payment method", paymentMethodItemSchema, 1),
});

export const validateSellPaymentInput = validationHandler({
  schema: sellPaymentInputSchema,
});

export const sellCoPaySetInputSchema = Joi.object({
  sellId: idRequired("Sell Id"),

  sellRefNo: strRequired("Sell Ref No"),

  sellDetailsId: idRequired("Sell Details Id"),

  coPayMode: enumRequired("Co-Pay Mode", {
    AMOUNT: "AMOUNT",
    PERCENT: "PERCENT",
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

export const validateSetSellCoPayInput = validationHandler({
  schema: sellCoPaySetInputSchema,
});
