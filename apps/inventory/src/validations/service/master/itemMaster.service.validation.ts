import {
  getCountItemsFromDb,
  getItemMasterByItemMasterCodeFromDb,
  getItemMasterByItemMasterNameFromDb,
} from "@/repository/master/itemMaster.repository";
import { itemCategoryService } from "@/services/master/itemCategory.service";
import { itemMasterService } from "@/services/master/itemMaster.service";
import { itemSupplierService } from "@/services/master/itemSupplier.service";
import { storageService } from "@/services/master/storage.service";
import { taxDetailsService } from "@/services/master/taxDetails.service";
import { unitMasterService } from "@/services/master/unitMaster.service";
import { getItems, ItemMasterReq, ItemMasterUpdateReq } from "@/types/master/itemMaster";
import { Item } from "@prisma/client";
import ErrorHandler from "@/utils/errorHandler.utils";
import { getBranchOrWarehouse } from "@/utils/getCollectionCenter.utils";
import { logger } from "@/utils/logger.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { validIdCheck } from "@/validations/global.validation";

export const validateIdItemMaster = async (itemMasterId: number) => {
  logger.info("entering::validateIdItemMaster::service::validation");
  validIdCheck(itemMasterId);

  const itemMaster = await itemMasterService.getItemMasterByIdWoDto(itemMasterId, true);
  if (!itemMaster) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Master"));
  }

  logger.info("exiting::validateIdItemMaster::service::validation");

  return itemMaster;
};

export const foreignKeyValidation = async (body: ItemMasterReq) => {
  const itemCategory = await itemCategoryService.getItemCategoryById(body.itemCategoryId, true);
  if (!itemCategory) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Category"));
  }

  const itemStore = await unitMasterService.getUnitMasterById(body.unitId, true);
  if (!itemStore) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Unit Master"));
  }
  if (body.taxDetailsId) {
    const taxDetails = await taxDetailsService.getTaxDetailsById(body.taxDetailsId, true);
    if (!taxDetails) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Tax Details"));
    }
  }
  if (body.storageId) {
    const store = await storageService.getStorageById(body.storageId, true);
    if (!store) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Storage"));
    }
  }
};
export const updateIdItemMasterServiceValidation = async (body: ItemMasterUpdateReq): Promise<Item> => {
  logger.info("entering::updateIdItemMaster::service::validation");
  const item = await validateIdItemMaster(Number(body.id));
  await foreignKeyValidation(body);

  const itemMasterByName = await getItemMasterByItemMasterNameFromDb(String(body.item));
  if (itemMasterByName && itemMasterByName.id !== body.id) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Item Master Name"));
  }

  if (body.itemCode) {
    const itemMasterByCode = await getItemMasterByItemMasterCodeFromDb(body.itemCode);
    if (itemMasterByCode && itemMasterByCode.id !== body.id) {
      throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Item Master Code"));
    }
  }
  logger.info("exiting::updateIdItemMaster::service::validation");
  return item;
};

export const createItemMasterServiceValidation = async (body: ItemMasterReq): Promise<void> => {
  logger.info("entering::createItemMaster::service::validation");
  await foreignKeyValidation(body);

  const itemMaster = await getItemMasterByItemMasterNameFromDb(body.item);
  if (itemMaster) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Item Master Name"));
  }

  if (body.itemCode) {
    const itemMasterByCode = await getItemMasterByItemMasterCodeFromDb(body.itemCode);
    if (itemMasterByCode) {
      throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Item Master Code"));
    }
  }

  logger.info("exiting::createItemMaster::service::validation");

  return;
};

export const validateBulkItemSupplierPricesService = async (input: getItems): Promise<void> => {
  logger.info("entering::validateBulkItemSupplierPricesService::service::validation");
  validIdCheck(input.supplierId);
  const supplier = await itemSupplierService.getItemSupplierById(input.supplierId, true);
  if (!supplier) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Supplier"));
  }

  if (input.ccId) {
    validIdCheck(input.ccId);
    const cc = await getBranchOrWarehouse(input.ccId);
    if (!cc) {
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Collection Center"));
    }
  }

  const uniqueItemIds = Array.from(input.itemIds || []);
  if (uniqueItemIds.length === 0) {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_FIELD", "Item Ids"));
  }
  uniqueItemIds.forEach((id) => validIdCheck(id));
  const items = await getCountItemsFromDb(uniqueItemIds);
  if (items.length !== uniqueItemIds.length) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item"));
  }
  logger.info("exiting::validateBulkItemSupplierPricesService::service::validation");
};
