import {
  getMedCompoByIdFromDb,
  getMedCompoByNameFromDb,
} from "@/repository/master/medComposition.repository.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdMedicineComposition = async (id: number) => {
  logger.info("entering::validateIdMedicineComposition service::validation");
  validIdCheck(id);
  const medComp = await getMedCompoByIdFromDb(id);
  if (!medComp) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Medicine Composition"),
    );
  }
  logger.info("exiting::validateIdMedicineComposition::service::validation");

  return medComp;
};

export const createMedCompoServiceValidation = async (body: DropDownName) => {
  logger.info(
    "entering::createMedCompoServiceValidation::serviceVal::validation",
  );
  const medCompo = await getMedCompoByNameFromDb(body.name);
  if (medCompo) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Medicine Composition Name"),
    );
  }

  logger.info("exiting::createMedCompoServiceValidation::service::validation");
  return medCompo;
};

export const updateIdMedCompoServiceValidation = async (
  body: DropDownName,
): Promise<void> => {
  logger.info(
    "entering::updateIdMedCompoServiceValidation::service::validation",
  );

  if (!body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Medicine Composition"),
    );
  }

  await validateIdMedicineComposition(body.id);

  const existingMedCompo = await getMedCompoByNameFromDb(body.name);

  if (existingMedCompo && existingMedCompo.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Medicine Composition"),
    );
  }

  logger.info(
    "exiting::updateIdMedCompoServiceValidation::service::validation",
  );
};
