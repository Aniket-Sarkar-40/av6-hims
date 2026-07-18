import { StockTransferUpdate } from "@/types/stock/stockTransfer.js";
import {
  PMS_STR_RETURN_STATUS,
  PMS_STR_STATUS,
} from "@repo/db/generated/prisma/enums.js";
import {
  arrayRequired,
  boolRequired,
  dateRequired,
  enumRequired,
  idOptional,
  idRequired,
  intRequired,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

// Reusable FromTo schema
const fromToSchema = Joi.object({
  type: enumRequired("Type", { warehouse: "warehouse", branch: "branch" }),
  id: idRequired("Id"),
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
  itemId: idRequired("Item Id"),
  warehouseId: idOptional("Warehouse Id"),
  branchId: idOptional("Branch Id"),
  quantity: intRequired("Quantity", 0),
  batchNo: strRequired("Batch No"),
  isFoc: boolRequired("isFoc"),
  expiryDate: dateRequired("Expiry Date"), // Accepts Date or string
});

const updateItemStockInputSchema = createItemStockInputSchema.keys({
  id: idRequired("Id"),
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
  staffId: idRequired("Staff Id"),
  ccId: fromToSchema.keys({
    type: enumRequired("Type", { warehouse: "warehouse" }),
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
    id: idRequired("Id"),
    items: arrayRequired("Items", updateItemStockInputSchema, 1),
  });

export const updateStockTransferInputSchema = Joi.object<StockTransferUpdate>({
  id: idRequired("Id"),
  ccId: idRequired("CC Id"),
});

export const deleteStockTransferInputSchema = Joi.object<StockTransferUpdate>({
  id: idRequired("Id"),
  ccId: idRequired("CC Id"),
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
      "any.only": `status must be one of ${Object.values(PMS_STR_STATUS).join(
        ", ",
      )}`,
      "string.base": "status must be a string",
    }),
  returnStatus: Joi.string()
    .valid(...Object.values(PMS_STR_RETURN_STATUS))
    .messages({
      "any.only": `returnStatus must be one of ${Object.values(
        PMS_STR_RETURN_STATUS,
      ).join(", ")}`,
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

export const validateAcknowledgeSearchStockTransfer = validationHandler({
  schema: acknowledgeStockTransferInputSchema,
});

export const validateSearchStockTransfer = validationHandler({
  schema: searchStockTransferSchema,
});

export const validateCreateStockTransfer = validationHandler({
  schema: createItemStockTransferInputSchema,
});

export const validateAppAckStockTransfer = validationHandler({
  schema: updateStockTransferInputSchema,
});

export const validateDeleteStockTransfer = validationHandler({
  schema: deleteStockTransferInputSchema,
});

export const validateUpdateStockTransfer = validationHandler({
  schema: updateItemStockTransferInputSchema,
});
