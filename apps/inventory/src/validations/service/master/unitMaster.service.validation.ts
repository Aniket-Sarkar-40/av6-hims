import { getUnitMasterByUnitMasterPackNameFromDb } from "@/repository/master/unitMaster.repository.js";
import { unitMasterService } from "@/services/master/unitMaster.service.js";
import { UnitMasterReq, UnitMasterUpdate } from "@/types/master/unitMaster.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { validateIdDefaultUnitMaster } from "@/validations/service/master/defaultMaster.service.validation.js";

export const validateIdUnitMaster = async (unitMasterId: number) => {
  logger.info("entering::validateIdUnitMaster::service::validation");

  validIdCheck(unitMasterId);

  const unitMaster = await unitMasterService.getUnitMasterById(
    unitMasterId,
    true,
  );
  if (!unitMaster) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Unit Master"),
    );
  }
  logger.info("exiting::validateIdUnitMaster::service::validation");

  return unitMaster;
};

export const updateIdUnitMasterServiceValidation = async (
  input: UnitMasterUpdate,
): Promise<void> => {
  logger.info("entering::updateIdUnitMaster::service::validation");
  await validateIdUnitMaster(input.id);

  const unitMasterByName = await getUnitMasterByUnitMasterPackNameFromDb(
    input.packagingTypeName,
  );
  if (unitMasterByName && unitMasterByName.id !== input.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Unit Master Name"),
    );
  }

  await validateIdDefaultUnitMaster(input.defaultUnitMasterId);

  logger.info("exiting::updateIdUnitMaster::service::validation");
  return;
};

export const createUnitMasterServiceValidation = async (
  body: UnitMasterReq,
): Promise<void> => {
  logger.info("entering::createUnitMaster::service::validation");
  const unitMasterName = await getUnitMasterByUnitMasterPackNameFromDb(
    body.packagingTypeName,
  );
  if (unitMasterName) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Unit Master Name"),
    );
  }

  await validateIdDefaultUnitMaster(body.defaultUnitMasterId);
  logger.info("exiting::createUnitMaster::service::validation");

  return;
};
