import {
  countItemBranchMapByItemIdFromDb,
  getItemBranchMapByIdFromDb,
  getItemBranchMapByItemAndBranchIdFromDb,
} from "@/repository/item/itemBranchMap.repository.js";
import { getWarehouseByIdFromDb } from "@/repository/master/warehouse.repository.js";
import {
  BranchToBranchPriceCopy,
  createItemBranchMapInput,
  GetItemBranchPricing,
  ItemBranchMap,
  ItemBranchMapExcelInput,
  ItemWiseItemBranchMapUpdate,
} from "@/types/item/itemBranchMap.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { validateIdBranch } from "../master/branch.service.validation.js";
import { validateIdItem } from "./item.service.validation.js";
import { getCountBranchesFromDb } from "@/repository/master/branch.repository.js";

export const validateIdItemBranchMap = async (id: number) => {
  logger.info("entering::validateIdItemBranchMap::service::validation");
  validIdCheck(id);
  const itemBranchMap = await getItemBranchMapByIdFromDb(id);
  if (!itemBranchMap) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "item branch"),
    );
  }
  logger.info("exiting::validateIdItemBranchMap::service::validation");

  return itemBranchMap;
};

export const createItemBranchMapServiceValidation = async (
  body: createItemBranchMapInput,
) => {
  logger.info(
    "entering::createItemBranchMapServiceValidation::serviceVal::validation",
  );

  await validateIdItem(body.itemId);
  const branches = await getCountBranchesFromDb(body.branchId);
  if (branches.length !== body.branchId.length) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Branch "),
    );
  }
  for (const branch of body.branchId) {
    const existing = await getItemBranchMapByItemAndBranchIdFromDb({
      itemId: body.itemId,
      branchId: branch,
    });

    if (existing) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "DUPLICATE_ITEM",
          `Item and branch mapping for branch ${branches.find((b) => b.id === branch)?.name}`,
        ),
      );
    }
  }

  logger.info("exiting::createItemBranchMap::service::validation");
};

export const updateItemBranchMapServiceValidation = async (
  body: ItemBranchMap,
) => {
  logger.info("entering::updateItemBranchMap::service::validation");
  if (!body.id)
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Item branch mapping "),
    );

  await validateIdItemBranchMap(body.id);
  await validateIdItem(body.itemId);
  await validateIdBranch(body.branchId);
  const existing = await getItemBranchMapByItemAndBranchIdFromDb({
    itemId: body.itemId,
    branchId: body.branchId,
  });

  if (existing && existing.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Item and branch mapping"),
    );
  }

  logger.info("exiting::updateItemBranchMap::service::validation");
};

/*--------SERVICE VALIDATION DOR ITEM BRANCH MAP IN BULK-----------*/

export const getItemBranchMapServiceValidation = async (
  body: GetItemBranchPricing,
) => {
  logger.info("entering::updateItemBranchMap::service::validation");

  await validateIdItem(body.itemId);
  await validateIdBranch(body.branchId);

  logger.info("exiting::updateItemBranchMap::service::validation");
};

export const updateItemWiseItemBranchMapServiceValidation = async (
  body: ItemWiseItemBranchMapUpdate,
) => {
  logger.info("entering::updateItemWiseItemBranchMap::service::validation");

  const warehouse = await getWarehouseByIdFromDb(body.ccId);
  if (!warehouse) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  }
  await validateIdItem(body.itemId);

  for (const detail of body.details) {
    await validateIdBranch(detail.branchId);
  }

  const countRecord = await countItemBranchMapByItemIdFromDb(body.itemId);
  if (countRecord !== body.details.length) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Item Branch Mapping"),
    );
  }
  logger.info("exiting::updateItemWiseItemBranchMap::service::validation");
};

export const copyBranchToBranchPriceServiceValidation = async (
  body: BranchToBranchPriceCopy,
) => {
  logger.info("entering::copyBranchToBranchPrice::service::validation");

  const warehouse = await getWarehouseByIdFromDb(body.ccId);
  if (!warehouse) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  }
  await validateIdBranch(body.fromBranchId);
  await validateIdBranch(body.toBranchId);
  if (body.fromBranchId === body.toBranchId) {
    throw new ErrorHandler(400, "Please choose different branch for copy");
  }
  logger.info("exiting::copyBranchToBranchPrice::service::validation");
};

export const exportExcelServiceValidation = async (
  body: ItemBranchMapExcelInput,
) => {
  logger.info("entering::exportExcel::service::validation");
  await validateIdBranch(body.branchId);
  logger.info("exiting::exportExcel::service::validation");
};
