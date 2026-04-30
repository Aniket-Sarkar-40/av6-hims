import { CreateGrnInput, GrnDetailInput } from "@/types/grn/grn.js";
import { joiDecimalFromSettings } from "@/utils/commonCalculation.utils.js";
import {
  DiscMethod,
  GRN_STATUS,
  PAYMENT_STATUS,
  PO_STATUS,
  TAX_METHOD,
} from "@repo/db/generated/prisma/enums.js";
import {
  arrayRequired,
  dateOptional,
  dateRequired,
  enumOptional,
  enumRequired,
  idOptional,
  idRequired,
  intRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const grnDetailSchema = Joi.object<GrnDetailInput>({
  id: idOptional("Id"),

  itemId: idRequired("Item Id"),

  poDetailsId: idRequired("PO Details Id"),

  itemMedCategory: strRequired("Medicine Category"),

  medType: strRequired("Medicine Type"),

  medComp: strRequired("Medicine Composition"),

  medUnit: strRequired("Medicine Unit"),

  manufacturer: strRequired("Manufacturer"),

  packSize: strRequired("Pack Size"),

  drugType: strRequired("Drug Type"),

  medTypeId: idRequired("Medicine Type Id"),

  medCompId: idRequired("Medicine Composition Id"),

  medUnitId: idRequired("Medicine Unit Id"),

  manufacturerId: idRequired("Manufacturer Id"),

  packSizeId: idRequired("Pack Size Id"),

  drugTypeId: idRequired("Drug Type Id"),

  purchasedPrice: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Purchased Price must be a number",
    "number.precision": "Purchased Price must have {{#limit}} decimal places",
    "any.required": "Purchased Price is required",
  }),

  focQuantity: intRequired("FOC Quantity"),

  netTax: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Net Tax must be a number",
    "number.precision": "Net Tax must have {{#limit}} decimal places",
    "any.required": "Net Tax is required",
  }),

  taxMethod: enumRequired("Tax Method", TAX_METHOD),

  batchNo: strRequired("Batch No"),

  totalAmount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Total amount must be a number",
    "number.precision": "Total amount must have {{#limit}} decimal places",
    "any.required": "Total amount is required",
  }),

  netAmount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Net amount must be a number",
    "number.precision": "Net amount must have {{#limit}} decimal places",
    "any.required": "Net amount is required",
  }),

  discountMethod: strRequired("Discount Method"),

  itemCategoryId: idOptional("Item Category Id"),

  mrp: joiDecimalFromSettings({ key: "grnPrecision", required: false })
    .optional()
    .allow(null)
    .messages({
      "number.base": "MRP must be a number",
      "number.precision": "MRP must have {{#limit}} decimal places",
    }),

  tax: joiDecimalFromSettings({
    key: "grnPrecision",
    required: false,
  }).messages({
    "number.base": "Tax must be a number",
    "number.precision": "Tax must have {{#limit}} decimal places",
  }),

  expiryDate: dateOptional("Expiry Date"),

  quantity: intRequired("Quantity"),

  discount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Discount must be a number",
    "number.precision": "Discount must have {{#limit}} decimal places",
    "any.required": "Discount is required",
  }),
  netDiscount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Net Discount amount must be a number",
    "number.precision": "Net Discount must have {{#limit}} decimal places",
    "any.required": "Net Discount is required",
  }),
});

export const grnSchema = Joi.object<CreateGrnInput>({
  id: idOptional("Id"),

  poNumber: strRequired("PO Number"),

  poId: idRequired("PO Id"),

  date: dateRequired("Date"),

  distributorId: idRequired("Distributor Id"),

  warehouseId: idRequired("Warehouse Id"),

  totalAmount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Total amount must be a number",
    "number.precision": "Total amount must have {{#limit}} decimal places",
    "any.required": "Total amount is required",
  }),

  discount: joiDecimalFromSettings({ key: "grnPrecision" }).messages({
    "number.base": "Discount must be a number",
    "number.precision": "Discount must have {{#limit}} decimal places",
  }),

  discountMethod: enumRequired("Discount Method", DiscMethod),

  netDiscount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Net discount must be a number",
    "number.precision": "Net discount must have {{#limit}} decimal places",
    "any.required": "Net discount is required",
  }),

  netTotal: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Net total must be a number",
    "number.precision": "Net total must have {{#limit}} decimal places",
    "any.required": "Net total is required",
  }),

  dueDate: dateRequired("Due Date"),

  netTax: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Net tax must be a number",
    "number.precision": "Net tax must have {{#limit}} decimal places",
    "any.required": "Net tax is required",
  }),

  gatePassId: idRequired("Gate Pass Id"),

  paidAmount: joiDecimalFromSettings({ key: "grnPrecision", required: false })
    .optional()
    .messages({
      "number.base": "Paid amount must be a number",
      "number.precision": "Paid amount must have {{#limit}} decimal places",
    }),

  notes: strOptional("Notes"),

  paymentStatus: enumOptional("Payment Status", PAYMENT_STATUS),

  status: enumOptional("Status", GRN_STATUS),

  billNo: strOptional("Bill No"),

  billDate: dateOptional("Bill Date"),

  tax: joiDecimalFromSettings({ key: "grnPrecision", required: false })
    .optional()
    .messages({
      "number.base": "Tax must be a number",
      "number.precision": "Tax must have {{#limit}} decimal places",
    }),

  shipping: joiDecimalFromSettings({ key: "grnPrecision", required: false })
    .optional()
    .messages({
      "number.base": "Shipping must be a number",
      "number.precision": "Shipping must have {{#limit}} decimal places",
    }),

  returnedAmount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: false,
  })
    .optional()
    .messages({
      "number.base": "Returned amount must be a number",
      "number.precision": "Returned amount must have {{#limit}} decimal places",
    }),

  margin: joiDecimalFromSettings({ key: "grnPrecision", required: false })
    .optional()
    .messages({
      "number.base": "Margin must be a number",
      "number.precision": "Margin must have {{#limit}} decimal places",
    }),

  goodReceiveDetails: arrayRequired("Good Receive Details", grnDetailSchema, 1),
});

export const grnExcelFilterSchema = Joi.object({
  id: idOptional("Id"),
  poNumber: strOptional("PO Number"),
  startDate: dateOptional("Start Date"),

  endDate: dateOptional("End Date"),
  warehouseId: idOptional("Warehouse Id"),
  distributorId: idOptional("Distributor Id"),
  status: enumOptional("Status", GRN_STATUS),
  paymentStatus: enumOptional("Payment Status", PAYMENT_STATUS),
  poStatus: enumOptional("PO Status", PO_STATUS),
  gatePassId: idOptional("Gate Pass Id"),
});

export const validateGrn = validationHandler({
  schema: grnSchema,
});

export const grnSchemaUpdate = grnSchema.keys({
  id: idRequired("Id"),
});

export const validateGrnUpdate = validationHandler({
  schema: grnSchemaUpdate,
});

export const validateExcelFilterGrn = validationHandler({
  schema: grnExcelFilterSchema,
});
