import { getDefaultUnitMasterByNameFromDb } from "@/repository/master/defaultUnitMaster.repository.js";
import { defaultUnitMasterService } from "@/services/master/defaultUnitMaster.service.js";
import { DefaultUnitMasterReq } from "@/types/master/defaultUnitMaster.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdDefaultUnitMaster = async (
  defaultUnitMasterId: number
) => {
  logger.info("entering::validateIdDefaultUnitMaster::service::validation");

  validIdCheck(defaultUnitMasterId);

  const defaultUnitMaster =
    await defaultUnitMasterService.getDefaultUnitMasterById(
      defaultUnitMasterId,
      true
    );
  if (!defaultUnitMaster) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Default Unit Master")
    );
  }
  logger.info("exiting::validateIdDefaultUnitMaster::service::validation");

  return defaultUnitMaster;
};

export const updateIdDefaultUnitMasterServiceValidation = async (
  input: DefaultUnitMasterReq
): Promise<void> => {
  logger.info("entering::updateIdDefaultUnitMaster::service::validation");
  if (input.id) {
    await validateIdDefaultUnitMaster(input.id);
  }

  const defaultUnitMasterByName = await getDefaultUnitMasterByNameFromDb(
    input.name
  );
  if (defaultUnitMasterByName && defaultUnitMasterByName.id !== input.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Default Unit Master Name")
    );
  }

  logger.info("exiting::updateIdDefaultUnitMaster::service::validation");
  return;
};

export const createDefaultUnitMasterServiceValidation = async (
  body: DefaultUnitMasterReq
): Promise<void> => {
  logger.info("entering::createDefaultUnitMaster::service::validation");
  const defaultUnitMasterName = await getDefaultUnitMasterByNameFromDb(
    body.name
  );
  if (defaultUnitMasterName) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Default Unit Master Name")
    );
  }
  logger.info("exiting::createDefaultUnitMaster::service::validation");

  return;
};
