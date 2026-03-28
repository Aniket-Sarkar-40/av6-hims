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
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const grnReturnDetailSchema = Joi.object<CreateGrnReturnDetailsInput>({
  itemId: Joi.number().integer().required().strict().messages({
    "number.base": "Item Id must be a number",
    "number.integer": "Item Id must be an integer",
    "any.required": "Item Id is required",
  }),

  itemCategoryId: Joi.number().integer().optional().allow(null).messages({
    "number.base": "Item category Id must be a number",
    "number.integer": "Item category Id must be an integer",
  }),

  itemMedCategory: Joi.string().required().messages({
    "string.base": "Item medical category must be a string",
    "any.required": "Item medical category is required",
  }),

  grnDetailsId: Joi.number().integer().required().strict().messages({
    "number.base": "GRN details Id must be a number",
    "number.integer": "GRN details Id must be an integer",
    "any.required": "GRN details Id is required",
  }),

  batchNo: Joi.string().required().messages({
    "string.base": "Batch number must be a string",
    "any.required": "Batch number is required",
  }),

  expiryDate: Joi.date().optional().allow(null).messages({
    "date.base": "Expiry date must be a valid date",
  }),

  quantity: Joi.number().integer().required().strict().messages({
    "number.base": "Quantity must be a number",
    "any.required": "Quantity is required",
  }),

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

  taxMethod: Joi.string()
    .valid(...Object.values(TAX_METHOD))
    .required()
    .strict()
    .messages({
      "string.base": "Tax method must be a string",
      "any.only": `Tax method must be one of ${Object.values(TAX_METHOD).join(", ")}`,
      "any.required": "Tax method is required",
    }),

  netAmount: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Net amount must be a number",
    "number.precision": "Net amount must have {{#limit}} decimal places",
    "any.required": "Net amount is required",
  }),

  discountMethod: Joi.string()
    .valid(...Object.values(DiscMethod))
    .required()
    .strict()
    .messages({
      "string.base": "Discount Method must be a string",
      "any.only": `Discount Method must be one of ${Object.values(DiscMethod).join(", ")}`,
      "any.required": "Discount Method is required",
    }),

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

  orderQty: Joi.number().integer().required().strict().messages({
    "number.base": "Order quantity must be a number",
    "any.required": "Order quantity is required",
  }),

  inHandQty: Joi.number().integer().required().strict().messages({
    "number.base": "In-hand quantity must be a number",
    "any.required": "In-hand quantity is required",
  }),

  grnQty: Joi.number().integer().required().strict().messages({
    "number.base": "GRN quantity must be a number",
    "any.required": "GRN quantity is required",
  }),
});

export const grnReturnSchema = Joi.object<CreateGrnReturnInput>({
  grnId: Joi.number().integer().required().strict().messages({
    "number.base": "GRN ID must be a number",
    "number.integer": "GRN ID must be an integer",
    "any.required": "GRN ID is required",
  }),

  poNumber: Joi.string().required().messages({
    "string.base": "PO number must be a string",
    "any.required": "PO number is required",
  }),

  grnNumber: Joi.string().required().messages({
    "string.base": "GRN number must be a string",
    "any.required": "GRN number is required",
  }),

  poId: Joi.number().integer().required().strict().messages({
    "number.base": "PO ID must be a number",
    "number.integer": "PO ID must be an integer",
    "any.required": "PO ID is required",
  }),

  date: Joi.date().required().messages({
    "date.base": "Date must be a valid date",
    "any.required": "Date is required",
  }),

  distributorId: Joi.number().integer().required().strict().messages({
    "number.base": "Distributor ID must be a number",
    "number.integer": "Distributor ID must be an integer",
    "any.required": "Distributor ID is required",
  }),

  warehouseId: Joi.number().integer().required().strict().messages({
    "number.base": "Warehouse ID must be a number",
    "number.integer": "Warehouse ID must be an integer",
    "any.required": "Warehouse ID is required",
  }),

  ccId: Joi.number().integer().required().strict().messages({
    "number.base": "CC ID must be a number",
    "number.integer": "CC ID must be an integer",
    "any.required": "CC ID is required",
  }),

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

  discountMethod: Joi.string()
    .valid(...Object.values(DiscMethod))
    .required()
    .messages({
      "string.base": "Discount method must be a string",
      "any.only": `Discount method must be one of ${Object.values(DiscMethod).join(", ")}`,
      "any.required": "Discount method is required",
    }),

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

  notes: Joi.string().optional().allow(null, "").messages({
    "string.base": "Notes must be a string",
  }),

  paymentStatus: Joi.string()
    .valid(...Object.values(PAYMENT_STATUS))
    .optional()
    .messages({
      "string.base": "Payment status must be a string",
      "any.only": `Payment status must be one of ${Object.values(PAYMENT_STATUS).join(", ")}`,
    }),

  status: Joi.string()
    .valid(...Object.values(RETURN_STS))
    .optional()
    .messages({
      "string.base": "Status must be a string",
      "any.only": `Status must be one of ${Object.values(RETURN_STS).join(", ")}`,
    }),

  billNo: Joi.string().optional().allow(null).messages({
    "string.base": "Bill number must be a string",
  }),

  billDate: Joi.date().optional().allow(null).messages({
    "date.base": "Bill date must be a valid date",
  }),

  dueDate: Joi.date().required().messages({
    "date.base": "Due date must be a valid date",
    "any.required": "Due date is required",
  }),

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

  creditNoteType: Joi.string().required().messages({
    "string.base": "Credit note type must be a string",
    "any.required": "Credit note type is required",
  }),

  creditNoteNo: Joi.number().required().messages({
    "number.base": "Credit note number must be a number",
    "any.required": "Credit note number is required",
  }),

  goodReceiveReturnDetails: Joi.array()
    .items(grnReturnDetailSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "Good receive return details must be an array",
      "array.min": "At least one Good receive return detail is required",
      "any.required": "Good receive return details are required",
    }),
});

export const grnReturnExcelSchema = Joi.object<GrnReturnReqExcelFilter>({
  id: Joi.number().integer().optional().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
  }),
  grnId: Joi.number().integer().optional().messages({
    "number.base": "GRN ID must be a number",
    "number.integer": "GRN ID must be an integer",
  }),
  grnNumber: Joi.string().optional().messages({
    "string.base": "GRN number must be a string",
  }),
  poNumber: Joi.string().optional().allow(null, "").messages({
    "string.base": "PO number must be a string",
  }),
  startDate: Joi.string().isoDate().optional().messages({
    "string.base": `Start date must be a string`,
    "string.isoDate": `Start date must be in ISO 8601 date format (YYYY-MM-DD)`,
  }),
  endDate: Joi.string().isoDate().optional().messages({
    "string.base": `End date must be a string`,
    "string.isoDate": `End date must be in ISO 8601 date format (YYYY-MM-DD)`,
  }),
  distributorId: Joi.number().integer().optional().messages({
    "number.base": "Distributor ID must be a number",
    "number.integer": "Distributor ID must be an integer",
  }),
  warehouseId: Joi.number().integer().optional().messages({
    "number.base": "Warehouse ID must be a number",
    "number.integer": "Warehouse ID must be an integer",
  }),
  status: Joi.string()
    .valid(...Object.values(RETURN_STS))
    .optional()
    .messages({
      "string.base": "Status must be a string",
      "any.only": `Status must be one of ${Object.values(RETURN_STS).join(", ")}`,
    }),
  paymentStatus: Joi.string()
    .valid(...Object.values(PAYMENT_STATUS))
    .optional()
    .messages({
      "string.base": "Payment status must be a string",
      "any.only": `Payment status must be one of ${Object.values(PAYMENT_STATUS).join(", ")}`,
    }),
});

export const validateGrnReturn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = grnReturnSchema.validate(req.body, {
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

export const grnReturnSchemaUpdate = grnReturnSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
    "any.required": "ID is required",
  }),
  goodReceiveReturnDetails: Joi.array().items(
    grnReturnDetailSchema.keys({
      id: Joi.number().integer().optional().messages({
        "number.base": "ID must be a number",
        "number.integer": "ID must be an integer",
        // "any.required": "ID is required",
      }),
      grnDetailsId: Joi.number().integer().optional().strict().messages({
        "number.base": "GRN details ID must be a number",
        "number.integer": "GRN details ID must be an integer",
      }),
    }),
  ),
});

export const validateGrnReturnUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = grnReturnSchemaUpdate.validate(req.body, {
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

export const grnReturnSchemaApprove = grnReturnSchemaUpdate.keys({
  ccId: Joi.number().integer().required().strict().messages({
    "number.base": "CC Id must be a number",
    "number.integer": "CC Id must be an integer",
    "any.required": "CC Id is required",
  }),
});

export const validateGrnReturnApprove = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = grnReturnSchemaApprove.validate(req.body, {
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

export const validateGrnReturnExcel = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = grnReturnExcelSchema.validate(req.body, {
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
