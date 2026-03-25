import { getWarehouseByWarehouseNameFromDb } from "@/repository/master/warehouse.repository";
import { branchService } from "@/services/master/branch.service";
import { warehouseService } from "@/services/master/warehouse.service";
import { WarehouseReq } from "@/types/master/warehouse";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { validIdCheck } from "@/validations/global.validation";

export const validateWarehouseId = async (warehouseId: number) => {
  logger.info("entering::validateWarehouseId::service::validation");

  validIdCheck(warehouseId);

  const warehouse = await warehouseService.getWarehouseById(warehouseId, true);
  if (!warehouse) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", `Warehouse id: ${warehouseId}`));
  }
  logger.info("exiting::validateWarehouseId::service::validation");

  return warehouse;
};

export const deleteWarehouseServiceValidation = async (warehouseId: number): Promise<void> => {
  logger.info("entering::deleteWarehouseServiceValidation::service::validation");

  await validateWarehouseId(warehouseId);
  logger.info("exiting::deleteWarehouseServiceValidation::service::validation");

  return;
};

export const getIdWarehouseServiceValidation = async (warehouseId: number): Promise<void> => {
  logger.info("entering::getIdWarehouseServiceValidation::service::validation");

  await validateWarehouseId(warehouseId);
  logger.info("exiting::getIdWarehouseServiceValidation::service::validation");

  return;
};

export const updateIdWarehouseServiceValidation = async (body: WarehouseReq): Promise<void> => {
  logger.info("entering::updateIdWarehouseServiceValidation::service::validation");
  await validateWarehouseId(body.id);

  const warehouseByName = await getWarehouseByWarehouseNameFromDb(body.name);
  if (warehouseByName && warehouseByName.id !== body.id) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Warehouse Name"));
  }
  logger.info("exiting::updateIdWarehouseServiceValidation::service::validation");
  return;
};

export const createWarehouseServiceValidation = async (body: WarehouseReq): Promise<void> => {
  logger.info("entering::createWarehouseServiceValidation::service::validation");
  // await validateWarehouseForeignKeys(body);
  const alreadyExistsWarehouse = await warehouseService.getWarehouseById(body.id, true);
  const alreadyExistsBranch = await branchService.getBranchById(body.id, true);
  if (alreadyExistsWarehouse || alreadyExistsBranch) {
    throw new ErrorHandler(400, "Collection center is already mapped");
  }

  const warehouse = await getWarehouseByWarehouseNameFromDb(body.name);
  if (warehouse) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Warehouse Name"));
  }
  logger.info("exiting::createWarehouseServiceValidation::service::validation");

  return;
};
