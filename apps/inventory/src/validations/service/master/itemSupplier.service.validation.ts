import {
  getItemSupplierByNameFromDb,
  getItemSupplierBySupplierCodeFromDb,
} from "@/repository/master/itemSupplier.repository";
import { itemSupplierService } from "@/services/master/itemSupplier.service";
import { ItemSupplierCreateInput, ItemSupplierDTO, ItemSupplierUpdateInput } from "@/types/master/itemSupplier";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { validIdCheck } from "@/validations/global.validation";
import { ItemSupplier } from "@prisma/client";

export const validateIdItemSupplier = async (itemSupplierId: number) => {
  logger.info("entering::validateIdItemSupplier::service::validation");

  validIdCheck(itemSupplierId);

  const itemSupplier = await itemSupplierService.getItemSupplierById(itemSupplierId, true);
  if (!itemSupplier) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Item Supplier"));
  }
  logger.info("exiting::validateIdItemSupplier::service::validation");

  return itemSupplier;
};

export const createItemSupplierServiceValidation = async (input: ItemSupplierCreateInput): Promise<void> => {
  logger.info("entering::createItemSupplier::service::validation");

  let itemSupplier: ItemSupplier | null;

  itemSupplier = await getItemSupplierBySupplierCodeFromDb(input.supplierCode);
  if (itemSupplier) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Item Supplier Code"));
  } else {
    itemSupplier = await getItemSupplierByNameFromDb(input.name);
    if (itemSupplier) {
      throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Item Supplier Name"));
    }
  }
  logger.info("exiting::createItemSupplier::service::validation");
};

export const updateItemSupplierServiceValidation = async (input: ItemSupplierUpdateInput): Promise<ItemSupplierDTO> => {
  logger.info("entering::updateItemSupplier::service::validation");

  const itemSupplier = await validateIdItemSupplier(input.id);

  if (input.supplierCode) {
    const existing = await getItemSupplierBySupplierCodeFromDb(input.supplierCode);
    if (existing && existing.id !== Number(input.id)) {
      throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Item Supplier Code"));
    }
  }

  if (input.name) {
    const existing = await getItemSupplierByNameFromDb(input.name);
    if (existing && existing.id !== Number(input.id)) {
      throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Item Supplier Name"));
    }
  }
  logger.info("exiting::updateItemSupplier::service::validation");
  return itemSupplier;
};

export const deleteItemSupplierServiceValidation = async (id: number): Promise<void> => {
  logger.info("entering::deleteItemSupplier::service::validation");
  await validateIdItemSupplier(id);
  logger.info("exiting::deleteItemSupplier::service::validation");
};
