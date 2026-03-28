import { StockTransferUpdate } from "@/types/stock/stockTransfer.js";
import {
  PMS_STR_RETURN_STATUS,
  PMS_STR_STATUS,
} from "@repo/db/generated/prisma/enums.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";

// Reusable FromTo schema
const fromToSchema = Joi.object({
  type: Joi.string().valid("warehouse", "branch").required().messages({
    "string.base": "Type must be a string",
    "string.valid": "Type must 'warehouse' and 'branch",
    "any.required": "Type is required",
  }),
  id: Joi.number().required().messages({
    "number.base": "Id must be a number",
    "any.required": "Id is required",
  }),
});

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

// Reusable CreateItemStockInput schema
const createItemStockInputSchema = Joi.object({
  itemId: Joi.number().required().messages({
    "number.base": "Item Id must be a number",
    "any.required": "Item Id is required",
  }),
  warehouseId: Joi.number().optional().messages({
    "number.base": "Warehouse Id must be a number",
    "any.optional": "Warehouse Id is optional",
  }),
  branchId: Joi.number().optional().messages({
    "number.base": "Branch Id must be a number",
    "any.optional": "Branch Id is optional",
  }),
  quantity: Joi.number().integer().strict().positive().required().messages({
    "number.base": "Quantity must be a number",
    "any.required": "Quantity is required",
  }),
  batchNo: Joi.string().required().messages({
    "string.base": "Batch number must be a string",
    "any.required": "Batch number is required",
  }),
  isFoc: Joi.boolean().required().messages({
    "boolean.base": "isFoc must be a boolean",
    "any.required": "isFoc is required",
  }),
  expiryDate: Joi.date().iso().required().messages({
    "date.base": "Expiry date must be a valid date",
    "date.iso": "Expiry date must be a valid ISO 8601 date",
    "any.required": "Expiry date is required",
  }), // Accepts Date or string
});

const updateItemStockInputSchema = createItemStockInputSchema.keys({
  id: Joi.number().integer().required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "any.required": "Id is required",
  }),
});
// Main schema: CreateItemStockTransferInput
export const createItemStockTransferInputSchema = Joi.object({
  items: Joi.array()
    .items(createItemStockInputSchema)
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
    .min(1)
    .required()
    .messages({
      "array.base": "Items must be an array",
      "array.min": "Items must contain at least one item",
      "any.required": "Items is required",
      "array.duplicateRow":
        "Duplicate item found in Stock Transfer. Row {{#duplicateRow}} duplicates Row {{#originalRow}} (itemId + batchNo + expiryDate + isFoc must be unique).",
    }),
  staffId: Joi.number().positive().integer().strict().messages({
    "number.base": "staffId must be a number",
    "any.required": "staffId is required",
  }),
  ccId: fromToSchema.keys({
    type: Joi.string().valid("warehouse").required().messages({
      "string.base": "Type must be a string",
      "string.valid": "Type must be 'warehouse'",
      "any.required": "Type is required",
    }),
  }),
  from: fromToSchema.required().messages({
    "object.base": "From must be an object",
    "object.required": "From is required",
    "any.required": "From.type, From.id are required",
  }),
  to: fromToSchema.required().messages({
    "object.base": "To must be an object",
    "object.required": "To is required",
    "any.required": "To.type, To.id are required",
  }),
});
// Main schema: CreateItemStockTransferInput
// Main schema: CreateItemStockTransferInput
export const updateItemStockTransferInputSchema =
  createItemStockTransferInputSchema.keys({
    id: Joi.number().integer().required().messages({
      "number.base": "Id must be a number",
      "number.integer": "Id must be an integer",
      "any.required": "Id is required",
    }),
    items: Joi.array()
      .items(updateItemStockInputSchema)
      .min(1)
      .required()
      .messages({
        "array.base": "Items must be an array",
        "array.min": "Items must contain at least one item",
        "any.required": "Items is required",
      }),
  });

export const updateStockTransferInputSchema = Joi.object<StockTransferUpdate>({
  id: Joi.number().positive().integer().strict().messages({
    "number.base": "Id must be a number",
    "any.required": "Id is required",
  }),
  ccId: Joi.number().positive().integer().strict().messages({
    "number.base": "ccId must be a number",
    "any.required": "ccId is required",
  }),
});

export const deleteStockTransferInputSchema = Joi.object<StockTransferUpdate>({
  id: Joi.number().positive().integer().messages({
    "number.base": "Id must be a number",
    "any.required": "Id is required",
  }),
  ccId: Joi.number().positive().integer().messages({
    "number.base": "ccId must be a number",
    "any.required": "ccId is required",
  }),
});

export const searchStockTransferSchema = Joi.object({
  pageNo: Joi.number().integer().min(1).required().messages({
    "number.base": "pageNo must be a number",
    "number.integer": "pageNo must be an integer",
    "number.min": "pageNo must be at least 1",
    "any.required": "pageNo is required",
  }),
  pageSize: Joi.number().integer().min(1).required().messages({
    "number.base": "pageSize must be a number",
    "number.integer": "pageSize must be an integer",
    "number.min": "pageSize must be at least 1",
    "any.required": "pageSize is required",
  }),
  searchText: Joi.string().allow("", null).messages({
    "string.base": "searchText must be a string",
  }),
  sortBy: Joi.string().required().messages({
    "string.base": "sortBy must be a string",
    "any.required": "sortBy is required",
  }),
  sortDir: Joi.string().valid("ASC", "DESC").required().messages({
    "any.only": "sortDir must be either ASC or DESC",
    "any.required": "sortDir is required",
  }),
  startDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{1,6}Z$/)
    .messages({
      "string.base": "startDate must be a string",
      "string.pattern.base": "startDate must be in timestamp format",
    }),
  endDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{1,6}Z$/)
    .messages({
      "string.base": "endDate must be a string",
      "string.pattern.base": "endDate must be in timestamp format",
    }),
  status: Joi.string()
    .valid(...Object.values(PMS_STR_STATUS))
    .messages({
      "any.only": `status must be one of ${Object.values(PMS_STR_STATUS).join(", ")}`,
      "string.base": "status must be a string",
    }),
  returnStatus: Joi.string()
    .valid(...Object.values(PMS_STR_RETURN_STATUS))
    .messages({
      "any.only": `returnStatus must be one of ${Object.values(PMS_STR_RETURN_STATUS).join(", ")}`,
      "string.base": "returnStatus must be a string",
    }),
  ccId: Joi.number().integer().messages({
    "number.base": "ccId must be a number",
    "number.integer": "ccId must be an integer",
  }),
  staffId: Joi.number().integer().messages({
    "number.base": "staffId must be a number",
    "number.integer": "staffId must be an integer",
  }),
});

export const acknowledgeStockTransferInputSchema = Joi.object({
  id: Joi.number().positive().integer().messages({
    "number.base": "Id must be a number",
    "any.required": "Id is required",
  }),
  ccId: Joi.number().positive().integer().messages({
    "number.base": "ccId must be a number",
    "any.required": "ccId is required",
  }),
  items: Joi.array()
    .items(updateItemStockInputSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "Items must be an array",
      "array.min": "Items must contain at least one item",
      "any.required": "Items is required",
    }),
});

export function validateAcknowledgeSearchStockTransfer(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = acknowledgeStockTransferInputSchema.validate(req.body, {
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
export function validateSearchStockTransfer(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = searchStockTransferSchema.validate(req.body, {
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

export function validateCreateStockTransfer(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = createItemStockTransferInputSchema.validate(req.body, {
    abortEarly: false, // show all errors
    allowUnknown: false, // restrict extra fields
  });

  if (error) {
    const errors = (error.details as ValidationErrorItem[]).map((d) => ({
      message: d.message.replace(/['"]/g, ""), // remove remaining quotes
      path: d.path,
      type: d.type,
      context: d.context,
    }));

    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: errors.map((e) => e.message).join(", "),
        errors,
      }),
    );
  }

  next();
}

export function validateAppAckStockTransfer(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = updateStockTransferInputSchema.validate(req.body, {
    abortEarly: false, // show all errors
    allowUnknown: false, // restrict extra fields
  });

  if (error) {
    const errors = (error.details as ValidationErrorItem[]).map((d) => ({
      message: d.message.replace(/['"]/g, ""), // remove remaining quotes
      path: d.path,
      type: d.type,
      context: d.context,
    }));

    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: errors.map((e) => e.message).join(", "),
        errors,
      }),
    );
  }

  next();
}

export function validateDeleteStockTransfer(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = deleteStockTransferInputSchema.validate(req.query, {
    abortEarly: false, // show all errors
    allowUnknown: false, // restrict extra fields
  });

  if (error) {
    const errors = (error.details as ValidationErrorItem[]).map((d) => ({
      message: d.message.replace(/['"]/g, ""), // remove remaining quotes
      path: d.path,
      type: d.type,
      context: d.context,
    }));

    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: errors.map((e) => e.message).join(", "),
        errors,
      }),
    );
  }

  next();
}

export function validateUpdateStockTransfer(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { error } = updateItemStockTransferInputSchema.validate(req.body, {
    abortEarly: false, // show all errors
    allowUnknown: false, // restrict extra fields
  });

  if (error) {
    const errors = (error.details as ValidationErrorItem[]).map((d) => ({
      message: d.message.replace(/['"]/g, ""), // remove remaining quotes
      path: d.path,
      type: d.type,
      context: d.context,
    }));

    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: errors.map((e) => e.message).join(", "),
        errors,
      }),
    );
  }

  next();
}
