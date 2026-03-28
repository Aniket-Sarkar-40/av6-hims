import {
  getBoxSizeByBoxSizeNameFromDb,
  getBoxSizeByIdFromDb,
} from "@/repository/master/BoxSize.repository.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdBoxSize = async (id: number) => {
  logger.info("entering::validateIdBoxSize service::validation");
  validIdCheck(id);
  const boxSize = await getBoxSizeByIdFromDb(id);
  if (!boxSize) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Box Size"));
  }
  logger.info("exiting::validateIdBoxSize::service::validation");

  return boxSize;
};

export const createBoxSizeServiceValidation = async (body: DropDownName) => {
  logger.info(
    "entering::createBoxSizeServiceValidation::serviceVal::validation",
  );
  const boxSize = await getBoxSizeByBoxSizeNameFromDb(body.name);
  if (boxSize) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Box Size Name"),
    );
  }

  logger.info("exiting::createBoxSizeServiceValidation::service::validation");
  return boxSize;
};

export const updateIdBoxSizeServiceValidation = async (
  body: DropDownName,
): Promise<void> => {
  logger.info(
    "entering::updateIdBoxSizeServiceValidation::service::validation",
  );

  if (!body.id) {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_ID", "Box Size"));
  }

  await validateIdBoxSize(body.id);

  const existingBoxSize = await getBoxSizeByBoxSizeNameFromDb(body.name);

  if (existingBoxSize && existingBoxSize.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Box Size"),
    );
  }

  logger.info("exiting::updateIdBoxSizeServiceValidation::service::validation");
};
