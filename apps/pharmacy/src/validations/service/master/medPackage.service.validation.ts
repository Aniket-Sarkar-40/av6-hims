import {
  getMedPackageByIdFromDb,
  getMedPackageByMedPackageNameFromDb,
  getMedPackageByNameFromDb,
} from "@/repository/master/medPackage.repository.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdMedicinePackage = async (id: number) => {
  logger.info("entering::validateIdMedicinePackage service::validation");
  validIdCheck(id);
  const medPackage = await getMedPackageByIdFromDb(id);
  if (!medPackage) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Medicine Package"),
    );
  }
  logger.info("exiting::validateIdMedicinePackage::service::validation");

  return medPackage;
};

export const createMedPackageServiceValidation = async (body: DropDownName) => {
  logger.info(
    "entering::createMedPackageServiceValidation::serviceVal::validation",
  );
  const medPackage = await getMedPackageByMedPackageNameFromDb(body.name);
  if (medPackage) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Medicine Package Name"),
    );
  }

  logger.info(
    "exiting::createMedPackageServiceValidation::service::validation",
  );
  return medPackage;
};

export const updateIdMedPackageServiceValidation = async (
  body: DropDownName,
): Promise<void> => {
  logger.info(
    "entering::updateIdMedPackageServiceValidation::service::validation",
  );

  if (!body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Medicine Package"),
    );
  }

  await validateIdMedicinePackage(body.id);

  const existingMedPackage = await getMedPackageByNameFromDb(body.name);

  if (existingMedPackage && existingMedPackage.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Medicine Package"),
    );
  }

  logger.info(
    "exiting::updateIdMedPackageServiceValidation::service::validation",
  );
};
