import { getUnitMasterByUnitMasterPackNameFromDb } from "@/repository/master/unitMaster.repository";
import { unitMasterService } from "@/services/master/unitMaster.service";
import { UnitMasterReq, UnitMasterUpdate } from "@/types/master/unitMaster";
import ErrorHandler from "@/utils/errorHandler.utils";
import { logger } from "@/utils/logger.utils";
import { generateErrorMessage } from "@/utils/responseMessage.utils";
import { validIdCheck } from "@/validations/global.validation";

export const validateIdUnitMaster = async (unitMasterId: number) => {
  logger.info("entering::validateIdUnitMaster::service::validation");

  validIdCheck(unitMasterId);

  const unitMaster = await unitMasterService.getUnitMasterById(unitMasterId, true);
  if (!unitMaster) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Unit Master"));
  }
  logger.info("exiting::validateIdUnitMaster::service::validation");

  return unitMaster;
};

export const updateIdUnitMasterServiceValidation = async (input: UnitMasterUpdate): Promise<void> => {
  logger.info("entering::updateIdUnitMaster::service::validation");
  await validateIdUnitMaster(input.id);

  const unitMasterByName = await getUnitMasterByUnitMasterPackNameFromDb(input.packagingTypeName);
  if (unitMasterByName && unitMasterByName.id !== input.id) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Unit Master Name"));
  }

  logger.info("exiting::updateIdUnitMaster::service::validation");
  return;
};

export const createUnitMasterServiceValidation = async (body: UnitMasterReq): Promise<void> => {
  logger.info("entering::createUnitMaster::service::validation");
  const unitMasterName = await getUnitMasterByUnitMasterPackNameFromDb(body.packagingTypeName);
  if (unitMasterName) {
    throw new ErrorHandler(400, generateErrorMessage("DUPLICATE_ITEM", "Unit Master Name"));
  }
  logger.info("exiting::createUnitMaster::service::validation");

  return;
};
