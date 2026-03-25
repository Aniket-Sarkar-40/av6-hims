import {
  getManufactureByIdFromDb,
  getManufactureByManufactureNameFromDb,
  getManufactureByNameFromDb,
} from "@/repository/master/manufacture.repository.js";
import { DropDownName } from "@/types/master/dropDownName.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdManufacture = async (id: number) => {
  logger.info("entering::validateIdManufacture service::validation");
  validIdCheck(id);
  const manufacture = await getManufactureByIdFromDb(id);
  if (!manufacture) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "manufacture"),
    );
  }
  logger.info("exiting::validateIdManufacture::service::validation");

  return manufacture;
};

export const createManufactureServiceValidation = async (
  body: DropDownName,
) => {
  logger.info(
    "entering::createManufactureServiceValidation::serviceVal::validation",
  );
  const manufacture = await getManufactureByManufactureNameFromDb(body.name);
  if (manufacture) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Manufacture Name"),
    );
  }

  logger.info(
    "exiting::createManufactureServiceValidation::service::validation",
  );
  return manufacture;
};

export const updateIdManufactureServiceValidation = async (
  body: DropDownName,
): Promise<void> => {
  logger.info(
    "entering::updateIdManufactureServiceValidation::service::validation",
  );

  if (!body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Manufacture"),
    );
  }

  await validateIdManufacture(body.id);

  const existingManufacture = await getManufactureByNameFromDb(body.name);

  if (existingManufacture && existingManufacture.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Manufacture"),
    );
  }

  logger.info(
    "exiting::updateIdManufactureServiceValidation::service::validation",
  );
};
