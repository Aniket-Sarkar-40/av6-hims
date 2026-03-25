import { getItemSupplierMapByItemAndSupplierFromDb } from "@/repository/itemSupplierMap/itemSupplierMap.repository";
import { itemSupplierMapService } from "@/services/itemSupplierMap/itemSupplierMap.service";
import { itemMasterService } from "@/services/master/itemMaster.service";
import { itemSupplierService } from "@/services/master/itemSupplier.service";
import {
  ItemSupplierMapCreateInput,
  ItemSupplierMapImportExcelInput,
  ItemSupplierMapUpdateInput,
} from "@/types/itemSupplierMap/itemSupplierMap";
import ErrorHandler from "@/utils/errorHandler.utils";
import { getBranchOrWarehouse } from "@/utils/getCollectionCenter.utils";
import { logger } from "@/utils/logger.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { validIdCheck } from "@/validations/global.validation";
import { validateIdItemMaster } from "../master/itemMaster.service.validation";
import { validateIdItemSupplier } from "../master/itemSupplier.service.validation";
import { GetItemReq } from "@/types/master/itemMaster";

export const validateIdItemSupplierMap = async (ItemSupplierMapId: number) => {
  logger.info("entering::validateIdItemSupplierMap::service::validation");

  validIdCheck(ItemSupplierMapId);

  const itemSupplierMap = await itemSupplierMapService.getItemSupplierMapById(ItemSupplierMapId, true);
  if (!itemSupplierMap) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Supplier Mapping"));
  }
  logger.info("exiting::validateIdItemSupplierMap::service::validation");

  return itemSupplierMap;
};

export const createItemSupplierMapServiceValidation = async (input: ItemSupplierMapCreateInput): Promise<void> => {
  logger.info("entering::createItemSupplierMap::service::validation");
  const cc = await getBranchOrWarehouse(input.ccId);

  if (!cc) {
    throw new ErrorHandler(400, generateErrorMessage("NOT_FOUND", "Collection Center"));
  }
  await validateIdItemMaster(input.itemId);
  await validateIdItemSupplier(input.supplierId);

  const itemSupplierMap = await getItemSupplierMapByItemAndSupplierFromDb(input.itemId, input.supplierId);
  if (itemSupplierMap) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Item Supplier Mapping"));
  }
  logger.info("exiting::createItemSupplierMap::service::validation");
};

export const updateItemSupplierMapServiceValidation = async (input: ItemSupplierMapUpdateInput): Promise<void> => {
  logger.info("entering::updateItemSupplierMap::service::validation");
  const exist = await validateIdItemSupplierMap(input.id);
  input.existing = exist;
  const cc = await getBranchOrWarehouse(input.ccId);

  if (!cc) {
    throw new ErrorHandler(400, generateErrorMessage("NOT_FOUND", "Collection Center"));
  }
  await validateIdItemMaster(input.itemId);
  await validateIdItemSupplier(input.supplierId);

  const itemSupplierMap = await getItemSupplierMapByItemAndSupplierFromDb(input.itemId, input.supplierId);
  if (itemSupplierMap && itemSupplierMap.id !== input.id) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Item Supplier Mapping"));
  }
  logger.info("exiting::updateItemSupplierMap::service::validation");
};

export const deleteItemSupplierMapServiceValidation = async (id: number): Promise<void> => {
  logger.info("entering::deleteItemSupplierMap::service::validation");
  await validateIdItemSupplierMap(id);
  logger.info("exiting::deleteItemSupplierMap::service::validation");
};

export const importExcelItemSupplierMapServiceValidation = async (input: ItemSupplierMapImportExcelInput) => {
  logger.info("entering::importExcelItemSupplierMap::service::validation");
  await validateIdItemSupplier(input.supplierId);
  const cc = await getBranchOrWarehouse(input.ccId);

  if (!cc) {
    throw new ErrorHandler(400, generateErrorMessage("NOT_FOUND", "Collection Center"));
  }
};

export const getItemSupplierMapServiceValidation = async (body: GetItemReq) => {
  logger.info("entering::getItemSupplierMapServiceValidation::service::validation");
  const supplier = body.supplierId ? await itemSupplierService.getItemSupplierById(body.supplierId, true) : null;
  if (!supplier) {
    throw new ErrorHandler(400, generateErrorMessage("NOT_FOUND", "Collection Center"));
  }

  const item = await itemMasterService.getItemMasterByIdWoDto(body.itemId, true);
  if (!item) {
    throw new ErrorHandler(400, generateErrorMessage("NOT_FOUND", "Item Master"));
  }

  const cc = body.ccId ? await getBranchOrWarehouse(body.ccId) : null;
  if (!cc) {
    throw new ErrorHandler(400, generateErrorMessage("NOT_FOUND", "Collection Center"));
  }
  logger.info("exiting::getItemSupplierMapServiceValidation::service::validation");
};
