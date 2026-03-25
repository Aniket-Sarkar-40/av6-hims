import {
  arrayRequired,
  boolOptional,
  dateOptional,
  dateRequired,
  enumRequired,
  idRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import {
  Action,
  InvStockAdjustmentStatus,
} from "@repo/db/generated/prisma/client";
import Joi from "joi";

// -------------------- StockAdjustmentDetails Schema --------------------
export const stockAdjustmentDetailsSchema = Joi.object({
  itemId: idRequired("Item Id"),

  batchNo: strOptional("Batch No"),
  expiryDate: dateOptional("Expiry Date"),

  isFoc: boolOptional("Is FOC"),

  quantity: idRequired("Quantity"),

  adjustType: enumRequired("Adjust Type", Action),
  availableQty: idRequired("Available Quantity"),
  batchId: idRequired("Batch Id"),
});

// -------------------- StockAdjustment Schema --------------------
export const stockAdjustmentSchema = Joi.object({
  ccId: idRequired("Collection Center Id"),

  targetCcId: idRequired("Target Collection Center Id"),

  date: dateRequired("Date"),

  description: strOptional("Description"),
  status: enumRequired("Status", InvStockAdjustmentStatus),

  isAvailQtyCheck: boolOptional("Available Qty Check"),

  stockAdjustmentDetails: arrayRequired(
    "Stock Adjustment Details",
    stockAdjustmentDetailsSchema,
    1,
  ),
});

export const updateStockAdjustmentSchema = stockAdjustmentSchema.keys({
  id: idRequired("Id"),

  stockAdjustmentDetails: arrayRequired(
    "Stock Adjustment Details",
    stockAdjustmentDetailsSchema,
    1,
  ),
});

// -------------------- Middleware --------------------
export const validateStockAdjustment = validationHandler({
  schema: stockAdjustmentSchema,
});
export const validateUpdateStockAdjustment = validationHandler({
  schema: updateStockAdjustmentSchema,
});
