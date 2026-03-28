import {
  getMedCategoryByIdFromDb,
  getMedCategoryByMedCategoryNameFromDb,
} from "@/repository/master/medCategory.repository.js";
import { MedCategoryInput } from "@/types/master/medCategory.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdMedCategory = async (medCategoryId: number) => {
  logger.info("entering::validateIdMedCategory::service::validation");
  validIdCheck(medCategoryId);

  const medCategory = await getMedCategoryByIdFromDb(medCategoryId);
  if (!medCategory || medCategory.isActive === false) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "medCategory"),
    );
  }
  logger.info("exiting::validateIdMedCategory::service::validation");
  return medCategory;
};

export const deleteMedCategoryServiceValidation = async (
  medCategoryId: number,
): Promise<void> => {
  logger.info(
    "entering::deleteMedCategoryServiceValidation::service::validation",
  );

  await validateIdMedCategory(medCategoryId);
  logger.info(
    "exiting::deleteMedCategoryServiceValidation::service::validation",
  );

  return;
};

export const getIdMedCategoryServiceValidation = async (
  medCategoryId: number,
): Promise<void> => {
  logger.info(
    "entering::getIdMedCategoryServiceValidation::service::validation",
  );

  await validateIdMedCategory(medCategoryId);

  logger.info(
    "exiting::getIdMedCategoryServiceValidation::service::validation",
  );

  return;
};

export const updateIdMedCategoryServiceValidation = async (
  medCategoryId: number,
  body: MedCategoryInput,
): Promise<void> => {
  logger.info(
    "entering::updateIdMedCategoryServiceValidation::service::validation",
  );
  await validateIdMedCategory(medCategoryId);

  const medCategoryByName = await getMedCategoryByMedCategoryNameFromDb(
    body.name,
  );
  if (medCategoryByName && medCategoryByName.id !== medCategoryId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Medicine Category Name"),
    );
  }
  logger.info(
    "exiting::updateIdMedCategoryServiceValidation::service::validation",
  );
  return;
};

export const createMedCategoryServiceValidation = async (
  body: MedCategoryInput,
): Promise<void> => {
  logger.info(
    "entering::createMedCategoryServiceValidation::service::validation",
  );
  // await validateMedCategoryForeignKeys(body);
  const medCategory = await getMedCategoryByMedCategoryNameFromDb(body.name);
  if (medCategory) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Medicine Category Name"),
    );
  }
  logger.info(
    "exiting::createMedCategoryServiceValidation::service::validation",
  );

  return;
};
