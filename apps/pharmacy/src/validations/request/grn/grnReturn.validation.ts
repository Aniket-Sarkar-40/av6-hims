import {
  CreateGrnReturnDetailsInput,
  CreateGrnReturnInput,
  GrnReturnReqExcelFilter,
} from "@/types/grn/grnReturn.js";
import { joiDecimalFromSettings } from "@/utils/commonCalculation.utils.js";
import {
  DiscMethod,
  RETURN_STS,
  PAYMENT_STATUS,
  TAX_METHOD,
} from "@repo/db/generated/prisma/enums.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
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
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const grnReturnDetailSchema = Joi.object<CreateGrnReturnDetailsInput>({
  itemId: idRequired("Item Id"),

  itemCategoryId: idOptional("Item Category Id"),

  itemMedCategory: strRequired("Item Medicine Category"),

  grnDetailsId: idRequired("GRN Details Id"),

  batchNo: strRequired("Batch No"),

  expiryDate: dateOptional("Expiry Date"),

  quantity: intRequired("Quantity"),

  purchasedPrice: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Purchased Price must be a number",
    "any.required": "Purchased Price is required",
    "number.precision": "Discount must have at most {{#limit}} decimal places.",
  }),

  totalAmount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Total amount must be a number",
    "number.precision": "Total amount must have {{#limit}} decimal places",
    "any.required": "Total amount is required",
  }),

  tax: joiDecimalFromSettings({ key: "grnPrecision" }).messages({
    "number.base": "Tax must be a number",
    "number.precision": "Tax must have {{#limit}} decimal places",
  }),

  netTax: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Net Tax must be a number",
    "number.precision": "Net Tax must have {{#limit}} decimal places",
    "any.required": "Net Tax is required",
  }),

  taxMethod: enumRequired("Tax Method", TAX_METHOD),

  netAmount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Net amount must be a number",
    "number.precision": "Net amount must have {{#limit}} decimal places",
    "any.required": "Net amount is required",
  }),

  discountMethod: enumRequired("Discount Method", DiscMethod),

  discount: joiDecimalFromSettings({ key: "grnPrecision" }).messages({
    "number.base": "Discount must be a number",
    "number.precision": "Discount must have {{#limit}} decimal places",
  }),

  netDiscount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Net Discount amount must be a number",
    "number.precision": "Net Discount must have {{#limit}} decimal places",
    "any.required": "Net Discount is required",
  }),

  orderQty: intRequired("Order Quantity"),

  inHandQty: intRequired("In Hand Quantity"),

  grnQty: intRequired("GRN Quantity"),
});

export const grnReturnSchema = Joi.object<CreateGrnReturnInput>({
  grnId: idRequired("GRN Id"),

  poNumber: strRequired("PO Number"),

  grnNumber: strRequired("GRN Number"),

  poId: idRequired("PO Id"),

  date: dateRequired("Date"),

  distributorId: idRequired("Distributor Id"),

  warehouseId: idRequired("Warehouse Id"),

  ccId: idRequired("CC Id"),

  totalAmount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Total amount must be a number",
    "any.required": "Total amount is required",
    "number.precision":
      "Total amount must have at most {{#limit}} decimal places.",
  }),

  discount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: false,
  }).messages({
    "number.base": "Discount must be a number",
    "number.precision": "Discount must have at most {{#limit}} decimal places.",
  }),

  discountMethod: enumRequired("Discount Method", DiscMethod),

  netDiscount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: false,
  }).messages({
    "number.base": "Net discount must be a number",
    "number.precision":
      "Net discount must have at most {{#limit}} decimal places.",
  }),

  netTotal: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Net total must be a number",
    "any.required": "Net total is required",
    "number.precision":
      "Net total must have at most {{#limit}} decimal places.",
  }),

  paidAmount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: false,
  }).messages({
    "number.base": "Paid amount must be a number",
    "number.precision":
      "Paid amount must have at most {{#limit}} decimal places.",
  }),

  notes: strOptional("Notes"),

  paymentStatus: enumOptional("Payment Status", PAYMENT_STATUS),

  status: enumOptional("Status", RETURN_STS),

  billNo: strOptional("Bill No"),

  billDate: dateOptional("Bill Date"),

  dueDate: dateRequired("Due Date"),

  tax: joiDecimalFromSettings({
    key: "grnPrecision",
    required: false,
  }).messages({
    "number.base": "Tax must be a number",
    "number.precision": "Tax must have at most {{#limit}} decimal places.",
  }),

  netTax: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Net tax must be a number",
    "any.required": "Net tax is required",
    "number.precision": "Net tax must have at most {{#limit}} decimal places.",
  }),

  shipping: joiDecimalFromSettings({
    key: "grnPrecision",
    required: false,
  }).messages({
    "number.base": "Shipping must be a number",
    "number.precision": "Shipping must have at most {{#limit}} decimal places.",
  }),

  creditNoteType: strRequired("Credit note type"),

  creditNoteNo: intRequired("Credit Note No"),

  goodReceiveReturnDetails: arrayRequired(
    "Good Receive Return Details",
    grnReturnDetailSchema,
    1,
  ),
});

export const grnReturnExcelSchema = Joi.object<GrnReturnReqExcelFilter>({
  id: idOptional("Id"),
  grnId: idOptional("GRN Id"),
  grnNumber: strOptional("GRN Number"),
  poNumber: strOptional("PO Number"),
  startDate: dateOptional("Start Date"),
  endDate: dateOptional("End Date"),
  distributorId: idOptional("Distributor Id"),
  warehouseId: idOptional("Warehouse Id"),
  status: enumOptional("Status", RETURN_STS),
  paymentStatus: enumOptional("Payment Status", PAYMENT_STATUS),
});

export const validateGrnReturn = validationHandler({
  schema: grnReturnSchema,
});

export const grnReturnSchemaUpdate = grnReturnSchema.keys({
  id: idRequired("Id"),
  goodReceiveReturnDetails: Joi.array().items(
    grnReturnDetailSchema.keys({
      id: idOptional("Id"),
      grnDetailsId: idOptional("GRN Details Id"),
    }),
  ),
});

export const validateGrnReturnUpdate = validationHandler({
  schema: grnReturnSchemaUpdate,
});

export const grnReturnSchemaApprove = grnReturnSchemaUpdate.keys({
  ccId: idRequired("CC Id"),
});

export const validateGrnReturnApprove = validationHandler({
  schema: grnReturnSchemaApprove,
});

export const validateGrnReturnExcel = validationHandler({
  schema: grnReturnExcelSchema,
});
