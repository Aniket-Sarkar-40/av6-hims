import {
  STOCK_SUMMARY_TYPE,
  StockOpeningClosingFilter,
} from "@/types/stock/stockOpeningClosing.js";
import {
  arrayOptional,
  boolOptional,
  dateOptional,
  dateRequired,
  enumOptional,
  idOptional,
  idRequired,
  numberArrayOptional,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

const STOCK_OPENING_CLOSING_GROUP_BY = {
  ITEM: "ITEM",
  ITEM_LOCATION: "ITEM_LOCATION",
  ITEM_BATCH: "ITEM_BATCH",
  ITEM_LOCATION_BATCH: "ITEM_LOCATION_BATCH",
  FULL: "FULL",
};

const STOCK_OPENING_CLOSING_SORT_BY = {
  itemName: "itemName",
  itemCode: "itemCode",
  openingQty: "openingQty",
  openingAmount: "openingAmount",
  inQty: "inQty",
  outQty: "outQty",
  netQty: "netQty",
  inAmount: "inAmount",
  outAmount: "outAmount",
  netAmount: "netAmount",
  closingQty: "closingQty",
  closingAmount: "closingAmount",
};

const SORT_DIR = {
  ASC: "ASC",
  DESC: "DESC",
};

export const stockOpeningClosingFilterSchema =
  Joi.object<StockOpeningClosingFilter>({
    financialYearId: idRequired("Financial Year Id"),

    fromDate: dateRequired("From Date"),
    toDate: dateRequired("To Date"),

    stockType: enumOptional("Stock Type", STOCK_SUMMARY_TYPE),

    itemId: idOptional("Item Id"),
    itemIds: numberArrayOptional("Item Ids"),

    categoryId: idOptional("Category Id"),
    categoryIds: numberArrayOptional("Category Ids"),

    ccId: idOptional("Collection Center Id"),
    ccIds: numberArrayOptional("Collection Center Ids"),

    fromCcId: idOptional("From Collection Center Id"),
    fromCcIds: numberArrayOptional("From Collection Center Ids"),

    toCcId: idOptional("To Collection Center Id"),
    toCcIds: numberArrayOptional("To Collection Center Ids"),

    userId: idOptional("User Id"),
    userIds: numberArrayOptional("User Ids"),

    batchNo: strOptional("Batch No"),
    batchNos: arrayOptional("Batch Nos", Joi.string().trim(), 1),

    expiryDate: dateOptional("Expiry Date"),
    isFoc: boolOptional("Is FOC"),

    searchText: strOptional("Search Text"),

    groupBy: enumOptional("Group By", STOCK_OPENING_CLOSING_GROUP_BY),

    includeZero: boolOptional("Include Zero"),

    // pageNo: intOptional("Page No", 1),
    // pageSize: intOptional("Page Size", 1),

    sortBy: enumOptional("Sort By", STOCK_OPENING_CLOSING_SORT_BY),
    sortDir: enumOptional("Sort Direction", SORT_DIR),
  });

export const validateStockOpeningClosingFilter = validationHandler({
  schema: stockOpeningClosingFilterSchema,
});
