import {
  getMedDosageByIdFromDb,
  getMedDosageByNameFromDb,
} from "@/repository/master/medDosage.repository.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdMedicineDosage = async (id: number) => {
  logger.info("entering::validateIdMedicineDosage service::validation");
  validIdCheck(id);
  const medDosage = await getMedDosageByIdFromDb(id);
  if (!medDosage) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Medicine Dosage"),
    );
  }
  logger.info("exiting::validateIdMedicineDosage::service::validation");

  return medDosage;
};

export const createMedDosageServiceValidation = async (body: DropDownName) => {
  logger.info(
    "entering::createMedDosageServiceValidation::serviceVal::validation",
  );
  const medDosage = await getMedDosageByNameFromDb(body.name);
  if (medDosage) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Medicine Dosage Name"),
    );
  }

  logger.info("exiting::createMedDosageServiceValidation::service::validation");
  return medDosage;
};

export const updateIdMedDosageServiceValidation = async (
  body: DropDownName,
): Promise<void> => {
  logger.info(
    "entering::updateIdMedDosageServiceValidation::service::validation",
  );

  if (!body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Medicine Dosage"),
    );
  }

  await validateIdMedicineDosage(body.id);

  const existingMedDosage = await getMedDosageByNameFromDb(body.name);

  if (existingMedDosage && existingMedDosage.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Medicine Dosage"),
    );
  }

  logger.info(
    "exiting::updateIdMedDosageServiceValidation::service::validation",
  );
};
