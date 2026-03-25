import {
  getMedDrugByIdFromDb,
  getMedDrugByMedDrugNameFromDb,
  getMedDrugByNameFromDb,
} from "@/repository/master/medDrug.repository.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdMedicineDrug = async (id: number) => {
  logger.info("entering::validateIdMedicineDrug service::validation");
  validIdCheck(id);
  const medDrug = await getMedDrugByIdFromDb(id);
  if (!medDrug) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Medicine Drug"),
    );
  }
  logger.info("exiting::validateIdMedicineDrug::service::validation");

  return medDrug;
};

export const createMedDrugServiceValidation = async (body: DropDownName) => {
  logger.info(
    "entering::createMedDrugServiceValidation::serviceVal::validation",
  );
  const medDrug = await getMedDrugByMedDrugNameFromDb(body.name);
  if (medDrug) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Medicine Drug Name"),
    );
  }

  logger.info("exiting::createMedDrugServiceValidation::service::validation");
  return medDrug;
};

export const updateIdMedDrugServiceValidation = async (
  body: DropDownName,
): Promise<void> => {
  logger.info(
    "entering::updateIdMedDrugServiceValidation::service::validation",
  );

  if (!body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Medicine Drug"),
    );
  }

  await validateIdMedicineDrug(body.id);

  const existingMedDrug = await getMedDrugByNameFromDb(body.name);

  if (existingMedDrug && existingMedDrug.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Medicine Drug"),
    );
  }

  logger.info("exiting::updateIdMedDrugServiceValidation::service::validation");
};
