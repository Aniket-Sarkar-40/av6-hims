import {
  StockTransferSearchInput,
  UpdateItemStockTransferInput,
} from "@/types/stock/stockTransfer.js";
import {
  ST_RETURN_STATUS,
  ST_STATUS,
} from "@repo/db/generated/prisma/enums.js";
import {
  boolRequired,
  dateOptional,
  idOptional,
  idRequired,
  strOptional,
  intRequired,
  dateRequired,
  enumOptional,
  arrayRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

const SORT_DIR = {
  ASC: "ASC",
  DESC: "DESC",
} as const;

export const stockTransferDetailsSchema = Joi.object({
  id: idOptional("Id"),

  itemId: idRequired("Item Id"),

  batchNo: strOptional("Batch No"),

  isFoc: boolRequired("Is FOC"),

  expiryDate: dateOptional("Expiry Date"),

  quantity: intRequired("Quantity", 0),
});

export const createStockTransferSchema = Joi.object({
  staffId: idRequired("Staff Id"),

  ccId: idRequired("CC Id"),

  fromId: idRequired("From Id"),

  toId: idRequired("To Id"),

  date: dateRequired("Date"),

  status: enumOptional("Status", ST_STATUS),

  returnStatus: enumOptional("Return status", ST_RETURN_STATUS),

  stockTransferDetails: arrayRequired(
    "Stock Transfer Details",
    stockTransferDetailsSchema,
    1,
  ),
});

export const updateStockTransferSchema = createStockTransferSchema.keys({
  id: idRequired("Id"),
}) as Joi.ObjectSchema<UpdateItemStockTransferInput>;

export const stockTransferActionSchema = Joi.object({
  id: idRequired("Id"),
  ccId: idRequired("CC Id"),
});

export const stockTransferAcknowledgeDetailSchema = Joi.object({
  id: idRequired("Stock Transfer Details Id"),
  quantity: intRequired("Acknowledged Quantity", 0),
});

export const acknowledgeStockTransferSchema = Joi.object({
  id: idRequired("Id"),
  ccId: idRequired("CC Id"),
  stockTransferDetails: arrayRequired(
    "Stock Transfer Details",
    stockTransferAcknowledgeDetailSchema,
    1,
  ),
});

export const getStockTransferByIdSchema = Joi.object({
  id: idRequired("Id"),
});

export const searchStockTransferSchema = Joi.object<StockTransferSearchInput>({
  pageNo: intRequired("Page no", 1),
  pageSize: intRequired("Page size", 1),

  searchText: strOptional("Search text"),

  sortBy: strOptional("Sort by"),

  sortDir: enumOptional("Sort direction", SORT_DIR),

  startDate: dateOptional("Start date"),

  endDate: dateOptional("End date"),

  status: enumOptional("Status", ST_STATUS),

  returnStatus: enumOptional("Return status", ST_RETURN_STATUS),

  ccId: idOptional("CC Id"),

  staffId: idOptional("Staff Id"),
});

export const validateCreateStockTransfer = validationHandler({
  schema: createStockTransferSchema,
});

export const validateUpdateStockTransfer = validationHandler({
  schema: updateStockTransferSchema,
});

export const validateDeleteStockTransfer = validationHandler({
  schema: stockTransferActionSchema,
});

export const validateApproveStockTransfer = validationHandler({
  schema: stockTransferActionSchema,
});

export const validateApproveReturnStockTransfer = validationHandler({
  schema: stockTransferActionSchema,
});

export const validateAcknowledgeStockTransfer = validationHandler({
  schema: acknowledgeStockTransferSchema,
});

export const validateGetStockTransferById = validationHandler({
  schema: getStockTransferByIdSchema,
  path: "query",
});

export const validateSearchStockTransfer = validationHandler({
  schema: searchStockTransferSchema,
});
