import {
  getInsuranceByIdFromDb,
  getInsuranceEmailByMobileNoFromDb,
} from "@/repository/insurance/insurance.repository.js";
import { InsuranceReq } from "@/types/insurance/insurance.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validateIdInsurance = async (id: number) => {
  logger.info("entering::validateIdInsurance service::validation");
  validIdCheck(id);
  const insurance = await getInsuranceByIdFromDb(id);
  if (!insurance) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "insurance"));
  }
  logger.info("exiting::validateIdInsurance::service::validation");

  return insurance;
};

export const createInsuranceServiceValidation = async (body: InsuranceReq) => {
  logger.info(
    "entering::createInsuranceServiceValidation::service::validation",
  );

  const email = await getInsuranceEmailByMobileNoFromDb(body.email);

  if (email) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("DUPLICATE_ITEM", "Email"),
    );
  }

  logger.info("exiting::createInsuranceServiceValidation::service::validation");
};

export const updateInsuranceServiceValidation = async (body: InsuranceReq) => {
  logger.info(
    "entering::updateInsuranceServiceValidation::service::validation",
  );

  if (body.id == null) {
    logger.error("missing insurance id in update request");
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "insurance id"),
    );
  }
  logger.info(`validating existence of insurance id=${body.id}`);
  await validateIdInsurance(body.id);

  logger.info("exiting::updateInsuranceServiceValidation::service::validation");
};

export const deleteInsuranceServiceValidation = async (id: number) => {
  logger.info(
    "entering::deleteInsuranceServiceValidation::service::validation",
  );

  await validateIdInsurance(id);

  logger.info("exiting::deleteInsuranceServiceValidation::service::validation");
};
