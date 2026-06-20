import {
  ItemStockExcelExportFilter,
  ItemStockSearchFilter,
} from "@/types/stock/stock.js";
import {
  idOptional,
  idRequired,
  intRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

const SORT_DIR = {
  ASC: "ASC",
  DESC: "DESC",
} as const;

export const itemStockSearchSchema = Joi.object<ItemStockSearchFilter>({
  pageNo: intRequired("Page no", 1),
  pageSize: intRequired("Page size", 1),
  shortCode: strOptional("Short code"),
  searchText: strOptional("Search text"),
  sortBy: strOptional("Sort by"),
  sortDir: Joi.string()
    .valid(...Object.values(SORT_DIR))
    .optional()
    .messages({
      "any.only": "Sort direction must be ASC or DESC",
    }),
  ccId: idRequired("CC Id"),
  userId: idOptional("User Id"),
  itemId: idOptional("Item Id"),
  categoryId: idOptional("Category Id"),
});

export const itemStockExcelExportSchema =
  Joi.object<ItemStockExcelExportFilter>({
    shortCode: strOptional("Short code"),
    searchText: strOptional("Search text"),
    sortBy: strOptional("Sort by"),
    sortDir: Joi.string()
      .valid(...Object.values(SORT_DIR))
      .optional()
      .messages({
        "any.only": "Sort direction must be ASC or DESC",
      }),
    ccId: idRequired("CC Id"),
    userId: idOptional("User Id"),
    itemId: idOptional("Item Id"),
    categoryId: idOptional("Category Id"),
  });

export const validateItemStockSearch = validationHandler({
  schema: itemStockSearchSchema,
});

export const validateItemStockExcelExport = validationHandler({
  schema: itemStockExcelExportSchema,
});
