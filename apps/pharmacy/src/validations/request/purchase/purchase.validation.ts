import {
  CreatePurchaseOrderInput,
  PurchaseOrderDetailInput,
  PurchaseReqExcelFilter,
} from "@/types/purchase/purchase.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { joiDecimalFromSettings } from "@/utils/commonCalculation.utils.js";
import { PO_STATUS } from "@repo/db/generated/prisma/enums.js";
import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";

export const purchaseOrderDetailSchema = Joi.object<PurchaseOrderDetailInput>({
  id: Joi.number().integer().optional().strict().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
  }),

  uom: Joi.string().optional().allow(null, "").messages({
    "string.base": "UOM must be a string or null",
  }),

  itemId: Joi.number().integer().required().strict().messages({
    "number.base": "Item Id must be a number",
    "number.integer": "Item Id must be an integer",
    "any.required": "Item Id is required",
  }),

  itemCategoryId: Joi.number().integer().required().strict().messages({
    "number.base": "Item category Id must be a number",
    "number.integer": "Item category Id must be an integer",
    "any.required": "Item category Id is required",
  }),

  itemMedCategory: Joi.string().required().messages({
    "string.base": "Item medicine category must be a string",
    "any.required": "Item medicine category is required",
  }),

  medType: Joi.string().required().messages({
    "string.base": "Medicine type must be a string",
    "any.required": "Medicine type is required",
  }),

  medComp: Joi.string().required().messages({
    "string.base": "Medicine composition must be a string",
    "any.required": "Medicine composition is required",
  }),

  medUnit: Joi.string().required().messages({
    "string.base": "Medicine unit must be a string",
    "any.required": "Medicine unit is required",
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

  medTypeId: Joi.number().integer().required().strict().messages({
    "number.base": "Medicine type Id must be a number",
    "number.integer": "Medicine type Id must be an integer",
    "any.required": "Medicine type Id is required",
  }),

  medCompId: Joi.number().integer().required().strict().messages({
    "number.base": "Medicine composition Id must be a number",
    "number.integer": "Medicine composition Id must be an integer",
    "any.required": "Medicine composition Id is required",
  }),

  medUnitId: Joi.number().integer().required().strict().messages({
    "number.base": "Medicine unit ID must be a number",
    "number.integer": "Medicine unit ID must be an integer",
    "any.required": "Medicine unit ID is required",
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

  mrp: joiDecimalFromSettings({ key: "poPrecision", required: false })
    .optional()
    .allow(null)
    .messages({
      "number.base": "MRP must be a number",
      "number.precision": "MRP must have {{#limit}} decimal places",
    }),

  purchasedPrice: joiDecimalFromSettings({
    key: "poPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": "Purchased price must be a number",
    "number.min": "Purchased price must be at least 0",
    "number.precision": "Purchased price must have {{#limit}} decimal places",
    "any.required": "Purchased price is required",
  }),

  packingQty: Joi.string().optional().allow(null).messages({
    "string.base": "Packing quantity must be a string or null",
  }),

  quantity: Joi.number().integer().required().strict().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "any.required": "Quantity is required",
  }),

  receivedQty: Joi.number().integer().optional().strict().messages({
    "number.base": "Received quantity must be a number",
    "number.integer": "Received quantity must be an integer",
  }),

  totalAmount: joiDecimalFromSettings({
    key: "poPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": "Total amount must be a number",
    "number.min": "Total amount must be at least 0",
    "number.precision": "Total amount must have {{#limit}} decimal places",
    "any.required": "Total amount is required",
  }),
});

// Schema for the create-purchase-order payload
export const purchaseSchema = Joi.object<CreatePurchaseOrderInput>({
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
  grandTotal: joiDecimalFromSettings({
    key: "poPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": `Grand Total must be a number`,
    "number.min": `Grand Total must be at least 0`,
    "number.precision": `Grand Total must have {{#limit}} decimal places`,
    "any.required": `Grand Total is required`,
  }),

  status: Joi.string()
    .valid(...Object.values(PO_STATUS))
    .optional()
    .messages({
      "string.base": "Status must be a string",
      "any.only": `Status must be one of ${Object.values(PO_STATUS).join(", ")}`,
    }),

  notes: Joi.string().optional().allow(null, "").messages({
    "string.base": "Notes must be a string",
  }),

  currency: Joi.string().optional().allow(null).messages({
    "string.base": "Currency must be a string",
  }),

  storageId: Joi.number().integer().optional().allow(null).strict().messages({
    "number.base": "Storage Id must be a number",
    "number.integer": "Storage Id must be an integer",
  }),

  paymentTerms: Joi.string().optional().allow(null, "").messages({
    "string.base": "Payment terms must be a string",
  }),

  purchaseOrderDetails: Joi.array()
    .items(purchaseOrderDetailSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "Purchase order details must be an array",
      "array.min": "At least one purchase order detail is required",
      "any.required": "Purchase order details are required",
    }),
});

export const validatePurchase = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = purchaseSchema.validate(req.body, {
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

export const purchaseSchemaUpdate = purchaseSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),
});

export const validatePurchaseUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = purchaseSchemaUpdate.validate(req.body, {
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

export const PurchaseExcelFilterSchema = Joi.object<PurchaseReqExcelFilter>({
  id: Joi.number().integer().optional().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
  }),
  poNumber: Joi.string().optional().messages({
    "string.base": "PO number must be a string",
  }),
  startDate: Joi.string().isoDate().optional().messages({
    "string.base": "Start date must be a string",
    "string.isoDate": "Start date must be in ISO 8601 date format (YYYY-MM-DD)",
  }),
  endDate: Joi.string().isoDate().optional().messages({
    "string.base": "End date must be a string",
    "string.isoDate": "End date must be in ISO 8601 date format (YYYY-MM-DD)",
  }),
  warehouseId: Joi.number().integer().optional().messages({
    "number.base": "Warehouse id must be a number",
    "number.integer": "Warehouse id must be an integer",
  }),
  distributorId: Joi.number().integer().optional().messages({
    "number.base": "Distributor id must be a number",
    "number.integer": "Distributor id must be an integer",
  }),
  storageId: Joi.number().integer().optional().messages({
    "number.base": "Storage id must be a number",
    "number.integer": "Storage id must be an integer",
  }),
  status: Joi.string()
    .valid(...Object.values(PO_STATUS))
    .optional()
    .messages({
      "string.base": "Status must be a string",
      "any.only": `Status must be one of ${Object.values(PO_STATUS).join(", ")}`,
    }),
});

export const validateExcelFilterPurchase = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = PurchaseExcelFilterSchema.validate(req.body, {
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
