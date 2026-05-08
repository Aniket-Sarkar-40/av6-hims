import {
  SellReturnDetailInput,
  SellReturnInput,
} from "@/types/sell/sellReturn.js";
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
import Joi from "joi";
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

export const sellReturnDetailInputSchema = Joi.object<SellReturnDetailInput>({
  itemId: idRequired("Item Id"),
  sellDetailsId: idRequired("Sell Details Id"),
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
  quantity: intRequired("Quantity", 0),

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
  discountMethod: enumRequired("Discount Method", DiscMethod),

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
  taxMethod: enumRequired("Tax Method", TAX_METHOD),

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
  sellQuantity: intRequired("Sell Quantity", 0),

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
  sellId: idRequired("Sell Id"),

  ccId: idRequired("CC Id"),

  sellNumber: strRequired("Sell Number"),

  staffId: idOptional("Staff Id"),
  aptId: idOptional("Apt Id"),
  aptNo: strOptional("Apt No"),
  deliveryType: enumRequired("Delivery Type", DeliveryType),
  paymentMode: enumOptional("Payment Mode", PmsPaymentMode),
  isHomeDelivery: boolOptional("Is Home Delivery").default(false),
  billDate: dateOptional("Bill Date"),
  customerId: idRequired("Customer Id"),
  billingFor: enumRequired("Billing For", BILL_FOR),
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
  discountMethod: enumOptional("Discount Method", DiscMethod),
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
  discountNote: strOptional("Discount Note"),
  taxMethod: enumRequired("Tax Method", TAX_METHOD),
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
  paymentStatus: enumOptional("Payment Status", PAYMENT_STATUS),
  status: enumOptional("Status", RETURN_STS),
  sellReturnDetails: arrayRequired(
    "Sell Return Details",
    sellReturnDetailInputSchema,
    1
  ),
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
  id: idRequired("Id"),
  sellReturnDetails: Joi.array().items(
    sellReturnDetailInputSchema.keys({
      id: idRequired("Id"),
    })
  ),
});

export const sellReturnExcelFilterSchema = Joi.object({
  id: idOptional("Id"),

  sellRefNo: strOptional("Sell Ref No"),

  sellReturnRefNo: strOptional("Sell Return Ref No"),

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

  paymentStatus: enumOptional("Payment status", PAYMENT_STATUS),

  status: enumOptional("Status", RETURN_STS),
})
  .strict()
  .unknown(false)
  .messages({
    "object.unknown": `"{{#label}}" is not allowed`,
  });
export const validateSellReturnInput = validationHandler({
  schema: sellReturnInputSchema,
});
export const validateSellReturnUpdate = validationHandler({
  schema: sellReturnSchemaUpdate,
});

export const validateSellReturnExcelFilter = validationHandler({
  schema: sellReturnExcelFilterSchema,
});
