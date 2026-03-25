import { CreateGrnInput, GrnDetailInput } from "@/types/grn/grn.js";
import { joiDecimalFromSettings } from "@/utils/commonCalculation.utils.js";
import {
  DiscMethod,
  GRN_STATUS,
  PAYMENT_STATUS,
  PO_STATUS,
  TAX_METHOD,
} from "@repo/db/generated/prisma/enums.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";

export const grnDetailSchema = Joi.object<GrnDetailInput>({
  id: Joi.number().integer().optional().strict().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
  }),

  itemId: Joi.number().integer().required().strict().messages({
    "number.base": "Item Id must be a number",
    "number.integer": "Item Id must be an integer",
    "any.required": "Item Id is required",
  }),

  poDetailsId: Joi.number().integer().required().strict().messages({
    "number.base": "PO details Id must be a number",
    "number.integer": "PO details Id must be an integer",
    "any.required": "PO details Id is required",
  }),

  itemMedCategory: Joi.string().required().messages({
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
    "string.base": "Pack Size must be a string",
    "any.required": "Pack Size is required",
  }),

  drugType: Joi.string().required().messages({
    "string.base": "Drug Type must be a string",
    "any.required": "Drug Type is required",
  }),

  medTypeId: Joi.number().integer().required().strict().messages({
    "number.base": "Medicine Type Id must be a number",
    "number.integer": "Medicine Type Id must be an integer",
    "any.required": "Medicine Type Id is required",
  }),

  medCompId: Joi.number().integer().required().strict().messages({
    "number.base": "Medicine Composition Id must be a number",
    "number.integer": "Medicine Composition Id must be an integer",
    "any.required": "Medicine Composition Id is required",
  }),

  medUnitId: Joi.number().integer().required().strict().messages({
    "number.base": "Medicine Unit Id must be a number",
    "number.integer": "Medicine Unit Id must be an integer",
    "any.required": "Medicine Unit Id is required",
  }),

  manufacturerId: Joi.number().integer().required().strict().messages({
    "number.base": "Manufacturer Id must be a number",
    "number.integer": "Manufacturer Id must be an integer",
    "any.required": "Manufacturer Id is required",
  }),

  packSizeId: Joi.number().integer().required().strict().messages({
    "number.base": "Pack Size Id must be a number",
    "number.integer": "Pack Size Id must be an integer",
    "any.required": "Pack Size Id is required",
  }),

  drugTypeId: Joi.number().integer().required().strict().messages({
    "number.base": "Drug Type Id must be a number",
    "number.integer": "Drug Type Id must be an integer",
    "any.required": "Drug Type Id is required",
  }),

  purchasedPrice: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Purchased Price must be a number",
    "number.precision": "Purchased Price must have {{#limit}} decimal places",
    "any.required": "Purchased Price is required",
  }),

  focQuantity: Joi.number().required().strict().messages({
    "number.base": "FOC Quantity must be a number",
    "any.required": "FOC Quantity is required",
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

  batchNo: Joi.string().required().messages({
    "string.base": "Batch number must be a string",
    "any.required": "Batch number is required",
  }),

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

  discountMethod: Joi.string().required().messages({
    "string.base": "Discount Method must be a string",
    "any.required": "Discount Method is required",
  }),

  itemCategoryId: Joi.number()
    .integer()
    .optional()
    .allow(null)
    .strict()
    .messages({
      "number.base": "Item Category Id must be a number",
      "number.integer": "Item Category Id must be an integer",
    }),

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

  expiryDate: Joi.date().optional().allow(null).messages({
    "date.base": "Expiry date must be a valid date",
  }),

  quantity: Joi.number().required().strict().messages({
    "number.base": "Quantity must be a number",
    "any.required": "Quantity is required",
  }),

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
  id: Joi.number().integer().optional().strict().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
  }),

  poNumber: Joi.string().required().messages({
    "string.base": "PO number must be a string",
    "any.required": "PO number is required",
  }),

  poId: Joi.number().integer().required().strict().messages({
    "number.base": "PO Id must be a number",
    "number.integer": "PO Id must be an integer",
    "any.required": "PO Id is required",
  }),

  date: Joi.date().required().messages({
    "date.base": "Date must be a valid date",
    "any.required": "Date is required",
  }),

  distributorId: Joi.number().integer().required().strict().messages({
    "number.base": "Distributor Id must be a number",
    "number.integer": "Distributor Id must be an integer",
    "any.required": "Distributor Id is required",
  }),

  warehouseId: Joi.number().integer().required().strict().messages({
    "number.base": "Warehouse Id must be a number",
    "number.integer": "Warehouse Id must be an integer",
    "any.required": "Warehouse Id is required",
  }),

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

  dueDate: Joi.date().required().messages({
    "date.base": "Due date must be a valid date",
    "any.required": "Due date is required",
  }),

  netTax: joiDecimalFromSettings({
    key: "grnPrecision",
    required: true,
  }).messages({
    "number.base": "Net tax must be a number",
    "number.precision": "Net tax must have {{#limit}} decimal places",
    "any.required": "Net tax is required",
  }),

  gatePassId: Joi.number().integer().required().strict().messages({
    "number.base": "Gate pass Id must be a number",
    "number.integer": "Gate pass Id must be an integer",
    "any.required": "Gate pass Id is required",
  }),

  paidAmount: joiDecimalFromSettings({ key: "grnPrecision", required: false })
    .optional()
    .messages({
      "number.base": "Paid amount must be a number",
      "number.precision": "Paid amount must have {{#limit}} decimal places",
    }),

  notes: Joi.string().optional().allow(null, "").messages({
    "string.base": "Notes must be a string or null",
  }),

  paymentStatus: Joi.string()
    .valid(...Object.values(PAYMENT_STATUS))
    .optional()
    .messages({
      "string.base": "Payment status must be a string",
      "any.only": `Payment status must be one of ${Object.values(PAYMENT_STATUS).join(", ")}`,
    }),

  status: Joi.string()
    .valid(...Object.values(GRN_STATUS))
    .optional()
    .messages({
      "string.base": "Status must be a string",
      "any.only": `Status must be one of ${Object.values(GRN_STATUS).join(", ")}`,
    }),

  billNo: Joi.string().optional().allow(null).messages({
    "string.base": "Bill number must be a string or null",
  }),

  billDate: Joi.date().optional().allow(null).messages({
    "date.base": "Bill date must be a valid date or null",
  }),

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

  goodReceiveDetails: Joi.array()
    .items(grnDetailSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "Good Receive Details must be an array",
      "array.min": "At least one Good Receive Details is required",
      "any.required": "Good Receive Details is required",
    }),
});

export const grnExcelFilterSchema = Joi.object({
  id: Joi.number().integer().positive().optional().messages({
    "number.base": `Id must be a number`,
    "number.integer": `Id must be an integer`,
    "number.positive": `Id must be a positive number`,
  }),
  poNumber: Joi.string().optional().messages({
    "string.base": `Po number must be a string`,
  }),
  startDate: Joi.string().isoDate().optional().messages({
    "string.base": `Start date must be a string`,
    "string.isoDate": `Start date must be in ISO 8601 date format (YYYY-MM-DD)`,
  }),

  endDate: Joi.string().isoDate().optional().messages({
    "string.base": `End date must be a string`,
    "string.isoDate": `End date must be in ISO 8601 date format (YYYY-MM-DD)`,
  }),
  warehouseId: Joi.number().integer().optional().messages({
    "number.base": `Warehouse id must be a number`,
    "number.integer": `Warehouse id must be an integer`,
  }),
  distributorId: Joi.number().integer().optional().messages({
    "number.base": `Distributor id must be a number`,
    "number.integer": `Distributor id must be an integer`,
  }),
  status: Joi.string()
    .valid(...Object.values(GRN_STATUS))
    .optional()
    .messages({
      "string.base": `Status must be a string`,
      "any.only": `Status must be one of ${Object.values(GRN_STATUS).join(", ")}`,
    }),
  paymentStatus: Joi.string()
    .valid(...Object.values(PAYMENT_STATUS))
    .optional()
    .messages({
      "string.base": `Status must be a string`,
      "any.only": `Status must be one of ${Object.values(PAYMENT_STATUS).join(", ")}`,
    }),
  poStatus: Joi.string()
    .valid(...Object.values(PO_STATUS))
    .optional()
    .messages({
      "string.base": `Status must be a string`,
      "any.only": `Status must be one of ${Object.values(PO_STATUS).join(", ")}`,
    }),
  gatePassId: Joi.number().integer().optional().messages({
    "number.base": `Gate pass id must be a number`,
    "number.integer": `Gate pass id must be an integer`,
  }),
});

export const validateGrn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = grnSchema.validate(req.body, {
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

export const grnSchemaUpdate = grnSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),
});

export const validateGrnUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = grnSchemaUpdate.validate(req.body, {
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

export const validateExcelFilterGrn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = grnExcelFilterSchema.validate(req.body, {
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
