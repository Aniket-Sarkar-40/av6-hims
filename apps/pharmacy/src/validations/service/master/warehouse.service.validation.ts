import { getBranchByIdFromDb } from "@/repository/master/branch.repository.js";
import {
  getWarehouseByIdFromDb,
  getWarehouseByWarehouseNameFromDb,
} from "@/repository/master/warehouse.repository.js";
import { WarehouseReq } from "@/types/master/warehouse.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { validateIdCollectionCenter } from "./collectionCenter.service.validation.js";
import { validIdState } from "@apps/core/validations/service/master/state.service.validation.js";
import { validIdCity } from "@apps/core/validations/service/master/city.service.validation.js";
import { validIdCountry } from "@apps/core/validations/service/master/country.service.validation.js";

export const validateWarehouseId = async (warehouseId: number) => {
  logger.info("entering::validateWarehouseId::service::validation");

  validIdCheck(warehouseId);

  const warehouse = await getWarehouseByIdFromDb(warehouseId);
  if (!warehouse) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", `Warehouse id: ${warehouseId}`),
    );
  }
  logger.info("exiting::validateWarehouseId::service::validation");

  return warehouse;
};

export const deleteWarehouseServiceValidation = async (
  warehouseId: number,
): Promise<void> => {
  logger.info(
    "entering::deleteWarehouseServiceValidation::service::validation",
  );

  await validateWarehouseId(warehouseId);
  logger.info("exiting::deleteWarehouseServiceValidation::service::validation");

  return;
};

export const getIdWarehouseServiceValidation = async (
  warehouseId: number,
): Promise<void> => {
  logger.info("entering::getIdWarehouseServiceValidation::service::validation");

  await validateWarehouseId(warehouseId);
  logger.info("exiting::getIdWarehouseServiceValidation::service::validation");

  return;
};

export const updateIdWarehouseServiceValidation = async (
  body: WarehouseReq,
): Promise<void> => {
  logger.info(
    "entering::updateIdWarehouseServiceValidation::service::validation",
  );
  await validateWarehouseId(body.id);
  if (body.stateId) await validIdState(body.stateId);
  if (body.cityId) await validIdCity(body.cityId);
  if (body.countryId) await validIdCountry(body.countryId);
  await validateIdCollectionCenter(body.id);

  const warehouseByName = await getWarehouseByWarehouseNameFromDb(body.name);
  if (warehouseByName && warehouseByName.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Warehouse Name"),
    );
  }
  logger.info(
    "exiting::updateIdWarehouseServiceValidation::service::validation",
  );
  return;
};

export const createWarehouseServiceValidation = async (
  body: WarehouseReq,
): Promise<void> => {
  logger.info(
    "entering::createWarehouseServiceValidation::service::validation",
  );
  // await validateWarehouseForeignKeys(body);
  const alreadyExistsWarehouse = await getWarehouseByIdFromDb(body.id);
  const alreadyExistsBranch = await getBranchByIdFromDb(body.id);
  if (alreadyExistsWarehouse || alreadyExistsBranch) {
    throw new ErrorHandler(400, "Collection center is already mapped");
  }
  if (body.stateId) await validIdState(body.stateId);
  if (body.cityId) await validIdCity(body.cityId);
  if (body.countryId) await validIdCountry(body.countryId);
  await validateIdCollectionCenter(body.id);

  const warehouse = await getWarehouseByWarehouseNameFromDb(body.name);
  if (warehouse) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Warehouse Name"),
    );
  }
  logger.info("exiting::createWarehouseServiceValidation::service::validation");

  return;
};
