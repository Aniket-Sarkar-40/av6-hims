import {
  getStoreByIdFromDb,
  getStoreByNameFromDb,
} from "@/repository/master/store.repository.js";
import { StoreCreateInput, StoreUpdateInput } from "@/types/master/store.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { validateIdBranch } from "./branch.service.validation.js";
import { validateWarehouseId } from "./warehouse.service.validation.js";

export const validateIdStore = async (storeId: number) => {
  logger.info("entering::validateIdStore::service::validation");
  validIdCheck(storeId);

  const store = await getStoreByIdFromDb(Number(storeId));
  if (!store || store.isActive === false) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Store"));
  }

  logger.info("exiting::validateIdStore::service::validation");
  return store;
};

export const createStoreServiceValidation = async (
  input: StoreCreateInput,
): Promise<void> => {
  logger.info("entering::createStoreServiceValidation::service::validation");

  const existing = await getStoreByNameFromDb(input.name);
  if (existing) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Store"),
    );
  }

  const hasBranch = input.branchId != null;
  const hasWarehouse = input.wareHouseId != null;
  if (hasBranch && hasWarehouse) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_FIELD",
        "Only one of branch or wareHouse may be provided",
      ),
    );
  }
  if (!hasBranch && !hasWarehouse) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_FIELD",
        "Either branch or wareHouse must be provided",
      ),
    );
  }

  if (hasBranch) {
    await validateIdBranch(input.branchId!);
  }
  if (hasWarehouse) {
    await validateWarehouseId(input.wareHouseId!);
  }

  logger.info("exiting::createStoreServiceValidation::service::validation");
};

export const updateStoreServiceValidation = async (
  input: StoreUpdateInput,
): Promise<void> => {
  logger.info("entering::updateStoreServiceValidation::service::validation");

  await validateIdStore(input.id);

  if (input.name) {
    const other = await getStoreByNameFromDb(input.name);
    if (other && other.id !== input.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Store"),
      );
    }
  }

  if (input.branchId != null && input.wareHouseId != null) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_FIELD",
        "Only one of branch or wareHouse may be provided",
      ),
    );
  }

  if (input.branchId != null) {
    await validateIdBranch(input.branchId);
  }
  if (input.wareHouseId != null) {
    await validateWarehouseId(input.wareHouseId);
  }

  logger.info("exiting::updateStoreServiceValidation::service::validation");
};
