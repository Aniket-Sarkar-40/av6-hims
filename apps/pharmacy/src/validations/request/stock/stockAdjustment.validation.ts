import Joi, { ValidationErrorItem } from "joi";
import {
  Action,
  STOCK_ADJUSTMENT_STATUS,
} from "@repo/db/generated/prisma/enums.js";
import { NextFunction, Request, Response } from "express";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { updateBatchExpiryInput } from "@/types/stock/stock.js";

// helper (keep outside schema)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeBatch = (v: any) => (v ?? "").toString().trim().toLowerCase();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeExpiry = (v: any) => {
  if (!v) return ""; // treat null/undefined as empty
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return "__invalid__"; // let Joi date validation handle it
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

// -------------------- StockAdjustmentDetails Schema --------------------
export const stockAdjustmentDetailsSchema = Joi.object({
  itemId: Joi.number().required().strict().messages({
    "number.base": "Item Id must be a number",
    "any.required": "Item Id is required",
  }),

  batchNo: Joi.string().trim().allow(null, "").optional().messages({
    "string.base": "Batch No must be a string",
  }),
  expiryDate: Joi.date().allow(null).optional().messages({
    "date.base": "Expiry Date must be a valid date",
    "date.format": "Expiry Date must be in ISO format (YYYY-MM-DD)",
  }),

  isFoc: Joi.boolean().messages({
    "boolean.base": "Is FOC must be a boolean value",
  }),

  quantity: Joi.number().integer().positive().required().strict().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.positive": "Quantity must be a positive number",
    "any.required": "Quantity is required",
  }),

  adjustType: Joi.string()
    .valid(...Object.values(Action))
    .required()
    .messages({
      "string.base": "Adjust Type must be a string",
      "any.only": `Adjust Type must be one of: ${Object.values(Action).join(", ")}`,
      "any.required": "Adjust Type is required",
    }),
  availableQty: Joi.number().integer().min(0).required().strict().messages({
    "number.base": "Available Quantity must be a number",
    "number.integer": "Available Quantity must be an integer",
    "number.min": "Available Quantity must be greater than or equal to 0",
    "any.required": "Available Quantity is required",
  }),
  batchId: Joi.number().integer().positive().required().strict().messages({
    "number.base": "Batch Id must be a number",
    "number.integer": "Batch Id must be an integer",
    "number.positive": "Batch Id must be a positive number",
    "any.required": "Batch Id is required",
  }),
});

// -------------------- StockAdjustment Schema --------------------
export const stockAdjustmentSchema = Joi.object({
  ccId: Joi.number().required().strict().messages({
    "number.base": "Collection Center Id must be a number",
    "any.required": "Collection Center Id is required",
  }),

  branchId: Joi.number().integer().positive().allow(null).optional().messages({
    "number.base": "Branch Id must be a number",
    "number.integer": "Branch Id must be an integer",
    "number.positive": "Branch Id must be a positive number",
  }),

  warehouseId: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .optional()
    .messages({
      "number.base": "Warehouse Id must be a number",
      "number.integer": "Warehouse Id must be an integer",
      "number.positive": "Warehouse Id must be a positive number",
    }),

  date: Joi.date().required().messages({
    "date.base": "Date must be a valid date",
    "any.required": "Date is required",
  }),

  description: Joi.string().allow(null, "").optional().messages({
    "string.base": "Description must be a string",
  }),
  status: Joi.string()
    .valid(...Object.values(STOCK_ADJUSTMENT_STATUS))
    .required()
    .messages({
      "string.base": "Status must be a string",
      "any.only": `Status must be one of: ${Object.values(STOCK_ADJUSTMENT_STATUS).join(", ")}`,
      "any.required": "Status is required",
    }),

  isAvailQtyCheck: Joi.boolean().default(false).optional().messages({
    "boolean.base": "Available Qty Check must be a boolean value",
  }),

  stockAdjustmentDetails: Joi.array()
    .items(stockAdjustmentDetailsSchema)
    .min(1)
    .required()
    .custom((rows, helpers) => {
      if (rows.length > 50) {
        return helpers.error("array.max", { max: 50 });
      }
      const seen = new Map<string, number>();

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];

        const key = [
          r.itemId,
          normalizeBatch(r.batchNo),
          normalizeExpiry(r.expiryDate),
          r.isFoc === true ? 1 : 0, // treat undefined/false both as 0 (change if you want)
        ].join("|");

        if (seen.has(key)) {
          const firstIndex = seen.get(key)!;

          return helpers.error("array.duplicateRow", {
            duplicateRow: i + 1, // 1-based index
            originalRow: firstIndex + 1,
          });
        }

        seen.set(key, i);
      }

      return rows;
    })
    .messages({
      "array.base": "Stock Adjustment Details must be an array",
      "array.min": "At least one Stock Adjustment Detail is required",
      "any.required": "Stock Adjustment Details are required",
      "array.duplicateRow":
        "Duplicate item found in Stock Adjustment Details. Row {{#duplicateRow}} duplicates Row {{#originalRow}} (itemId + batchNo + expiryDate + isFoc must be unique).",
      "array.max":
        "You can't add more than {{#max}} items to the stock adjustment.",
    }),
})
  .xor("branchId", "warehouseId")
  .messages({
    "object.missing": "Either Branch Id or Warehouse Id must be provided",
    "object.xor":
      "Only one of Branch Id or Warehouse Id should be present, not both",
  });

export const updateStockAdjustmentDetailsSchema =
  stockAdjustmentDetailsSchema.keys({
    id: Joi.number().integer().optional().strict().messages({
      "number.base": "Details id must be a number",
      "number.integer": "Details id must be an integer",
    }),
  });

export const updateStockAdjustmentSchema = stockAdjustmentSchema.keys({
  id: Joi.number().integer().required().strict().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),

  stockAdjustmentDetails: Joi.array()
    .items(updateStockAdjustmentDetailsSchema)
    .min(1)
    .required()
    .custom((rows, helpers) => {
      const seen = new Map<string, number>();

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];

        const key = [
          r.itemId,
          normalizeBatch(r.batchNo),
          normalizeExpiry(r.expiryDate),
          r.isFoc === true ? 1 : 0, // treat undefined/false both as 0 (change if you want)
        ].join("|");

        if (seen.has(key)) {
          const firstIndex = seen.get(key)!;

          return helpers.error("array.duplicateRow", {
            duplicateRow: i + 1, // 1-based index
            originalRow: firstIndex + 1,
          });
        }

        seen.set(key, i);
      }

      return rows;
    })
    .messages({
      "array.base": "Stock Adjustment Details must be an array",
      "array.min": "At least one Stock Adjustment Detail is required",
      "any.required": "Stock Adjustment Details are required",
      "array.duplicateRow":
        "Duplicate item found in Stock Adjustment Details. Row {{#duplicateRow}} duplicates Row {{#originalRow}} (itemId + batchNo + expiryDate + isFoc must be unique).",
    }),
});

export const updateBatchExpirySchema = Joi.object<updateBatchExpiryInput>({
  ids: Joi.array()
    .items(Joi.number().integer().positive())
    .required()
    .strict()
    .messages({
      "array.base": "Ids must be an array",
      "array.items": "Ids must be an array of numbers",
      "array.positive": "Ids must be an array of positive numbers",
      "any.required": "Ids are required",
    }),
  newExp: Joi.date().required().messages({
    "date.base": "New Expiry Date must be a valid date",
    "any.required": "New Expiry Date is required",
  }),
}).messages({
  "object.missing": "Ids and New Expiry Date are required",
});

// -------------------- Middleware --------------------
export function validateStockAdjustment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = stockAdjustmentSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
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
}
export function validateUpdateStockAdjustment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = updateStockAdjustmentSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
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
}
export function validateUpdateBatchExpiry(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error, value } = updateBatchExpirySchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });

  req.body = value;

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
}
