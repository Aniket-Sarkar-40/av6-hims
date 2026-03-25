import {
  getMedUnitByIdFromDb,
  getMedUnitByNameFromDb,
} from "@/repository/master/medUnit.repository.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdMedicineUnit = async (id: number) => {
  logger.info("entering::validateIdMedicineUnit service::validation");
  validIdCheck(id);
  const medUnit = await getMedUnitByIdFromDb(id);
  if (!medUnit) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "medicine Unit"),
    );
  }
  logger.info("exiting::validateIdMedicineUnit::service::validation");

  return medUnit;
};

export const createMedUnitServiceValidation = async (body: DropDownName) => {
  logger.info(
    "entering::createMedUnitServiceValidation::serviceVal::validation",
  );
  const medUnit = await getMedUnitByNameFromDb(body.name);
  if (medUnit) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Medicine Unit Name"),
    );
  }

  logger.info("exiting::createMedUnitServiceValidation::service::validation");
  return medUnit;
};

export const updateIdMedUnitServiceValidation = async (
  body: DropDownName,
): Promise<void> => {
  logger.info(
    "entering::updateIdMedUnitServiceValidation::service::validation",
  );

  if (!body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Medicine Unit"),
    );
  }

  await validateIdMedicineUnit(body.id);

  const existingMedUnit = await getMedUnitByNameFromDb(body.name);

  if (existingMedUnit && existingMedUnit.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Medicine Unit"),
    );
  }

  logger.info("exiting::updateIdMedUnitServiceValidation::service::validation");
};
