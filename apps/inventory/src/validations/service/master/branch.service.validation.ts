import { getBranchByBranchNameFromDb } from "@/repository/master/branch.repository.js";
import { BranchReq } from "@/types/master/branch.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { branchService } from "@/services/master/branch.service.js";
import { warehouseService } from "@/services/master/warehouse.service.js";

export const validateIdBranch = async (branchId: number) => {
  logger.info("entering::validateIdBranch::service::validation");

  validIdCheck(branchId);

  const branch = await branchService.getBranchById(branchId, true);
  if (!branch) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Branch"));
  }
  logger.info("exiting::validateIdBranch::service::validation");

  return branch;
};

export const deleteBranchServiceValidation = async (
  branchId: number,
): Promise<void> => {
  logger.info("entering::deleteBranchServiceValidation::service::validation");

  await validateIdBranch(branchId);
  logger.info("exiting::deleteBranchServiceValidation::service::validation");

  return;
};

export const getIdBranchServiceValidation = async (
  branchId: number,
): Promise<void> => {
  logger.info("entering::getIdBranchServiceValidation::service::validation");

  await validateIdBranch(branchId);
  logger.info("exiting::getIdBranchServiceValidation::service::validation");

  return;
};

export const updateIdBranchServiceValidation = async (
  branchId: number,
  body: BranchReq,
): Promise<void> => {
  logger.info("entering::updateIdBranchServiceValidation::service::validation");
  await validateIdBranch(branchId);

  const branchByName = await getBranchByBranchNameFromDb(body.name);
  if (branchByName && branchByName.id !== branchId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Branch Name"),
    );
  }
  logger.info("exiting::updateIdBranchServiceValidation::service::validation");
  return;
};

export const createBranchServiceValidation = async (
  body: BranchReq,
): Promise<void> => {
  logger.info("entering::createBranchServiceValidation::service::validation");
  // await validateBranchForeignKeys(body);
  const alreadyExistsWarehouse = await warehouseService.getWarehouseById(
    body.id,
    true,
  );
  const alreadyExistsBranch = await branchService.getBranchById(body.id, true);
  if (alreadyExistsWarehouse || alreadyExistsBranch) {
    throw new ErrorHandler(400, "Collection center is already mapped");
  }

  const branch = await getBranchByBranchNameFromDb(body.name);
  if (branch) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Branch Name"),
    );
  }
  logger.info("exiting::createBranchServiceValidation::service::validation");

  return;
};
