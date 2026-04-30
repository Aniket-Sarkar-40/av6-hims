import Joi from "joi";
import {
  Action,
  STOCK_ADJUSTMENT_STATUS,
} from "@repo/db/generated/prisma/enums.js";
import { updateBatchExpiryInput } from "@/types/stock/stock.js";
import {
  boolOptional,
  dateOptional,
  dateRequired,
  enumRequired,
  idOptional,
  idRequired,
  intRequired,
  numberArrayRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

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
  itemId: idRequired("Item Id"),

  batchNo: strOptional("Batch No"),
  expiryDate: dateOptional("Expiry Date"),

  isFoc: boolOptional("isFoc"),

  quantity: intRequired("Quantity", 0),

  adjustType: enumRequired("Adjust Type", Action),
  availableQty: intRequired("Available Qty", 0),
  batchId: idRequired("Batch Id"),
});

// -------------------- StockAdjustment Schema --------------------
export const stockAdjustmentSchema = Joi.object({
  ccId: idRequired("CC Id"),

  branchId: idOptional("Branch Id"),

  warehouseId: idOptional("Warehouse Id"),

  date: dateRequired("Date"),

  description: strOptional("Description"),
  status: enumRequired("Status", STOCK_ADJUSTMENT_STATUS),

  isAvailQtyCheck: boolOptional("Is Available Qty Check").default(false),

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
    id: idOptional("Id"),
  });

export const updateStockAdjustmentSchema = stockAdjustmentSchema.keys({
  id: idRequired("Id"),

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
  ids: numberArrayRequired("Ids"),
  newExp: dateRequired("New Exp"),
}).messages({
  "object.missing": "Ids and New Expiry Date are required",
});

// -------------------- Middleware --------------------
export const validateStockAdjustment = validationHandler({
  schema: stockAdjustmentSchema,
});

export const validateUpdateStockAdjustment = validationHandler({
  schema: updateStockAdjustmentSchema,
});

export const validateUpdateBatchExpiry = validationHandler({
  schema: updateBatchExpirySchema,
});
