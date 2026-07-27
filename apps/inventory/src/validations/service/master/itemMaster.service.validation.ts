import {
  getCountItemsFromDb,
  getItemMasterByItemMasterCodeFromDb,
  getItemMasterByItemMasterNameFromDb,
} from "@/repository/master/itemMaster.repository.js";
import { itemCategoryService } from "@/services/master/itemCategory.service.js";
import { itemMasterService } from "@/services/master/itemMaster.service.js";
import { itemSupplierService } from "@/services/master/itemSupplier.service.js";
import { storageService } from "@/services/master/storage.service.js";
import { taxDetailsService } from "@/services/master/taxDetails.service.js";
import { unitMasterService } from "@/services/master/unitMaster.service.js";
import {
  getItems,
  ItemMasterReq,
  ItemMasterUpdateReq,
} from "@/types/master/itemMaster.js";
import { InvItem } from "@repo/db/generated/prisma/client";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { getBranchOrWarehouse } from "@/utils/getCollectionCenter.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { getItemStockByItemId } from "@/repository/stock/stock.repository.js";

export const validateIdItemMaster = async (itemMasterId: number) => {
  logger.info("entering::validateIdItemMaster::service::validation");
  validIdCheck(itemMasterId);

  const itemMaster = await itemMasterService.getItemMasterByIdWoDto(
    itemMasterId,
    true,
  );
  if (!itemMaster) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Item Master"),
    );
  }

  logger.info("exiting::validateIdItemMaster::service::validation");

  return itemMaster;
};

export const foreignKeyValidation = async (body: ItemMasterReq) => {
  const itemCategory = await itemCategoryService.getItemCategoryById(
    body.itemCategoryId,
    true,
  );
  if (!itemCategory) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Item Category"),
    );
  }

  const itemStore = await unitMasterService.getUnitMasterById(
    body.unitId,
    true,
  );
  if (!itemStore) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Unit Master"),
    );
  }
  if (body.taxDetailsId) {
    const taxDetails = await taxDetailsService.getTaxDetailsById(
      body.taxDetailsId,
      true,
    );
    if (!taxDetails) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Tax Details"),
      );
    }
  }
  if (body.storageId) {
    const store = await storageService.getStorageById(body.storageId, true);
    if (!store) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Storage"));
    }
  }
};
export const updateIdItemMasterServiceValidation = async (
  body: ItemMasterUpdateReq,
): Promise<InvItem> => {
  logger.info("entering::updateIdItemMaster::service::validation");
  const item = await validateIdItemMaster(Number(body.id));
  await foreignKeyValidation(body);

  const itemStock = await getItemStockByItemId(Number(body.id));
  if (itemStock) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("NOT_POSSIBLE", "Item Master"),
    );
  }

  const itemMasterByName = await getItemMasterByItemMasterNameFromDb(
    String(body.item),
  );
  if (itemMasterByName && itemMasterByName.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Item Master Name"),
    );
  }

  if (body.itemCode) {
    const itemMasterByCode = await getItemMasterByItemMasterCodeFromDb(
      body.itemCode,
    );
    if (itemMasterByCode && itemMasterByCode.id !== body.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Item Master Code"),
      );
    }
  }
  logger.info("exiting::updateIdItemMaster::service::validation");
  return item;
};

export const createItemMasterServiceValidation = async (
  body: ItemMasterReq,
): Promise<void> => {
  logger.info("entering::createItemMaster::service::validation");
  await foreignKeyValidation(body);

  const itemMaster = await getItemMasterByItemMasterNameFromDb(body.item);
  if (itemMaster) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Item Master Name"),
    );
  }

  if (body.itemCode) {
    const itemMasterByCode = await getItemMasterByItemMasterCodeFromDb(
      body.itemCode,
    );
    if (itemMasterByCode) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Item Master Code"),
      );
    }
  }

  logger.info("exiting::createItemMaster::service::validation");

  return;
};

export const validateBulkItemSupplierPricesService = async (
  input: getItems,
): Promise<void> => {
  logger.info(
    "entering::validateBulkItemSupplierPricesService::service::validation",
  );
  validIdCheck(input.supplierId);
  const supplier = await itemSupplierService.getItemSupplierById(
    input.supplierId,
    true,
  );
  if (!supplier) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Item Supplier"),
    );
  }

  if (input.ccId) {
    validIdCheck(input.ccId);
    const cc = await getBranchOrWarehouse(input.ccId);
    if (!cc) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Collection Center"),
      );
    }
  }

  const uniqueItemIds = Array.from(input.itemIds || []);
  if (uniqueItemIds.length === 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_FIELD", "Item Ids"),
    );
  }
  uniqueItemIds.forEach((id) => validIdCheck(id));
  const items = await getCountItemsFromDb(uniqueItemIds);
  if (items.length !== uniqueItemIds.length) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
  }
  logger.info(
    "exiting::validateBulkItemSupplierPricesService::service::validation",
  );
};
