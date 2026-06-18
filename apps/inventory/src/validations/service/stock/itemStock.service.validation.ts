import { settingsService } from "@/services/master/settings.service.js";
import { ItemStockSearchFilter } from "@/types/stock/stock.js";
import { validateIdBranch } from "@/validations/service/master/branch.service.validation.js";
import { validateWarehouseId } from "@/validations/service/master/warehouse.service.validation.js";
import { validateStaffCollectionCenter } from "@/validations/service/purchase/storeRequisition.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateItemStockSearch = async (
  input: ItemStockSearchFilter
): Promise<void> => {
  logger.info("entering::validateItemStockSearch::service::validation");

  validIdCheck(input.ccId);

  const settings = await settingsService.getSettings();

  const warehouseMode = Boolean(settings?.warehouseMode);
  if (warehouseMode) {
    await validateWarehouseId(input.ccId);
  } else {
    await validateIdBranch(input.ccId);
  }

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
