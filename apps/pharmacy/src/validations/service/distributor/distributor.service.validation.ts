import {
  getDistributorByIdWoDto,
  getDistributorByProEmailId,
  getDistributorByProPhoneNumber,
} from "@/repository/distributor/distributor.repository.js";
import {
  CreateDistributorInput,
  UpdateDistributorInput,
} from "@/types/distributor/distributor.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdDistributor = async (id: number) => {
  logger.info("entering::validateIdDistributor service::validation");
  validIdCheck(id);
  const distributor = await getDistributorByIdWoDto(id);
  if (!distributor) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "distributor "),
    );
  }
  logger.info("exiting::validateIdDistributor::service::validation");

  return distributor;
};

export const createDistributorServiceValidation = async (
  body: CreateDistributorInput,
) => {
  logger.info(
    "entering::createDistributorServiceValidation::serviceVal::validation",
  );

  if (body.proInEmail) {
    const existingEmail = await getDistributorByProEmailId(body.proInEmail);
    if (existingEmail) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Proprietary Email"),
      );
    }
  }

  if (body.proInPhone) {
    const existingPhone = await getDistributorByProPhoneNumber(body.proInPhone);
    if (existingPhone) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Proprietary Phone"),
      );
    }
  }

  logger.info(
    "exiting::createDistributorServiceValidation::service::validation",
  );
};

export const updateDistributorServiceValidation = async (
  body: UpdateDistributorInput,
) => {
  logger.info(
    "entering::updateDistributorServiceValidation::serviceVal::validation",
  );

  if (!body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Distributor"),
    );
  }

  const distributor = await validateIdDistributor(Number(body.id));

  if (body.proInEmail) {
    const existingEmail = await getDistributorByProEmailId(body.proInEmail);
    if (existingEmail && existingEmail.id !== Number(body.id)) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Proprietary Email"),
      );
    }
  }

  if (body.proInPhone) {
    const existingPhone = await getDistributorByProPhoneNumber(body.proInPhone);
    if (existingPhone && existingPhone.id !== Number(body.id)) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Proprietary Phone"),
      );
    }
  }

  logger.info(
    "exiting::updateDistributorServiceValidation::service::validation",
  );

  return distributor;
};
