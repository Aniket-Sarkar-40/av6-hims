import {
  getMedTypeByIdFromDb,
  getMedTypeByMedTypeNameFromDb,
} from "@/repository/master/medType.repository.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdMedType = async (medTypeId: number) => {
  logger.info("entering::validateIdMedType::service::validation");

  validIdCheck(medTypeId);

  const medType = await getMedTypeByIdFromDb(medTypeId);
  if (!medType || medType.isActive === false) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Medicine Type"),
    );
  }
  logger.info("exiting::validateIdMedType::service::validation");

  return medType;
};

export const deleteMedTypeServiceValidation = async (
  medTypeId: number,
): Promise<void> => {
  logger.info("entering::deleteMedTypeServiceValidation::service::validation");

  await validateIdMedType(medTypeId);
  logger.info("exiting::deleteMedTypeServiceValidation::service::validation");

  return;
};

export const getIdMedTypeServiceValidation = async (
  medTypeId: number,
): Promise<void> => {
  logger.info("entering::getIdMedTypeServiceValidation::service::validation");

  await validateIdMedType(medTypeId);
  logger.info("exiting::getIdMedTypeServiceValidation::service::validation");

  return;
};

export const updateIdMedTypeServiceValidation = async (
  medTypeId: number,
  body: DropDownName,
): Promise<void> => {
  logger.info(
    "entering::updateIdMedTypeServiceValidation::service::validation",
  );
  await validateIdMedType(medTypeId);

  const medTypeByName = await getMedTypeByMedTypeNameFromDb(body.name);
  if (medTypeByName && medTypeByName.id !== medTypeId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Medicine Type Name"),
    );
  }
  logger.info("exiting::updateIdMedTypeServiceValidation::service::validation");
  return;
};

export const createMedTypeServiceValidation = async (
  body: DropDownName,
): Promise<void> => {
  logger.info("entering::createMedTypeServiceValidation::service::validation");
  // await validateMedTypeForeignKeys(body);
  const medType = await getMedTypeByMedTypeNameFromDb(body.name);
  if (medType) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Medicine Type Name"),
    );
  }
  logger.info("exiting::createMedTypeServiceValidation::service::validation");

  return;
};
