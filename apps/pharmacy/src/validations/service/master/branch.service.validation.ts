import {
  getBranchByBranchNameFromDb,
  getBranchByIdFromDb,
} from "@/repository/master/branch.repository.js";
import { BranchReq } from "@/types/master/branch.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { validateIdCollectionCenter } from "./collectionCenter.service.validation.js";
import { getWarehouseByIdFromDb } from "@/repository/master/warehouse.repository.js";
import { medCategoryService } from "@/services/master/medCategory.service.js";
import { validIdState } from "@apps/core/validations/service/master/state.service.validation.js";
import { validIdCity } from "@apps/core/validations/service/master/city.service.validation.js";
import { validIdCountry } from "@apps/core/validations/service/master/country.service.validation.js";

export const validateIdBranch = async (branchId: number) => {
  logger.info("entering::validateIdBranch::service::validation");

  validIdCheck(branchId);

  const branch = await getBranchByIdFromDb(branchId);
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
  if (body.stateId) await validIdState(body.stateId);
  if (body.cityId) await validIdCity(body.cityId);
  if (body.countryId) await validIdCountry(body.countryId);
  await validateIdCollectionCenter(body.id);
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
  const alreadyExistsWarehouse = await getWarehouseByIdFromDb(body.id);
  const alreadyExistsBranch = await getBranchByIdFromDb(body.id);
  if (alreadyExistsWarehouse || alreadyExistsBranch) {
    throw new ErrorHandler(400, "Collection center is already mapped");
  }
  if (body.stateId) await validIdState(body.stateId);
  if (body.cityId) await validIdCity(body.cityId);
  if (body.countryId) await validIdCountry(body.countryId);
  await validateIdCollectionCenter(body.id);
  const branch = await getBranchByBranchNameFromDb(body.name);
  if (branch) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Branch Name"),
    );
  }
  if (body.categories && body.categories.length !== 0) {
    await Promise.all(
      body.categories.map(async (category) => {
        await medCategoryService.getMedCategoryById(category);
      }),
    );
  }
  logger.info("exiting::createBranchServiceValidation::service::validation");

  return;
};
