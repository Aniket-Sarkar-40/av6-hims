import { ItemStockSearchFilter } from "@/types/stock/stock.js";
import { validateBranchOrWarehouse } from "@/utils/getCollectionCenter.utils.js";
import { validateStaffCollectionCenter } from "@/validations/service/master/collectionCenter.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateItemStockSearch = async (
  input: ItemStockSearchFilter
): Promise<void> => {
  logger.info("entering::validateItemStockSearch::service::validation");

  validIdCheck(input.ccId);

  await validateBranchOrWarehouse(input.ccId);

  if (input.userId) {
    validIdCheck(input.userId);
    await validateStaffCollectionCenter(input.userId, input.ccId);
  }

  if (input.itemId) {
    validIdCheck(input.itemId);
  }

  if (input.categoryId) {
    validIdCheck(input.categoryId);
  }

  logger.info("exiting::validateItemStockSearch::service::validation");
};
