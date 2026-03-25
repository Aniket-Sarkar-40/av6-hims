import {
  getMedInstructionByIdFromDb,
  getMedInstructionByNameFromDb,
} from "@/repository/master/medInstruction.repository.js";
import { InstructionName } from "@/types/master/dropDownName.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdMedicineInstruction = async (id: number) => {
  logger.info("entering::validateIdMedicineInstruction service::validation");
  validIdCheck(id);
  const medInstruction = await getMedInstructionByIdFromDb(id);
  if (!medInstruction) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Medicine Instruction"),
    );
  }
  logger.info("exiting::validateIdMedicineInstruction::service::validation");

  return medInstruction;
};

export const createMedInstructionServiceValidation = async (
  body: InstructionName,
) => {
  logger.info(
    "entering::createMedInstructionServiceValidation::serviceVal::validation",
  );
  const medInstruction = await getMedInstructionByNameFromDb(
    body.instructionName,
  );
  if (medInstruction) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Medicine Instruction Name"),
    );
  }

  logger.info(
    "exiting::createMedInstructionServiceValidation::service::validation",
  );
  return medInstruction;
};

export const updateIdMedInstructionServiceValidation = async (
  body: InstructionName,
): Promise<void> => {
  logger.info(
    "entering::updateIdMedInstructionServiceValidation::service::validation",
  );

  if (!body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Medicine Instruction"),
    );
  }

  await validateIdMedicineInstruction(body.id);

  const existingMedInstruction = await getMedInstructionByNameFromDb(
    body.instructionName,
  );

  if (existingMedInstruction && existingMedInstruction.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Medicine Instruction"),
    );
  }

  logger.info(
    "exiting::updateIdMedInstructionServiceValidation::service::validation",
  );
};
