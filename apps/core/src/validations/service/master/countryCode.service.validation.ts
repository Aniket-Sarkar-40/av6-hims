import {
  getCountryCodeByCountryFromDb,
  getCountryCodeByIdFromDb,
  getCountryCodeByNameFromDb,
} from "@/repository/master/countryCode.repository.js";
import {
  CreateCountryCode,
  UpdateCountryCode,
} from "@/types/master/countryCode.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { validIdCountry } from "./country.service.validation.js";

export const validateIdCountryCode = async (id: number) => {
  logger.info("entering::validateIdCountryCode::service::validation");

  validIdCheck(id);
  const countryCode = await getCountryCodeByIdFromDb(id);

  if (!countryCode) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Country Code")
    );
  }
  logger.info("exiting::validateIdCountryCode::service::validation");
  return countryCode;
};

export const createCountryCodeValidation = async (input: CreateCountryCode) => {
  logger.info("entering::createCountryCode::service::validation");
  await validIdCountry(input.countryId);

  const countryCode = await getCountryCodeByCountryFromDb(input.countryId);
  if (countryCode) {
    throw new ErrorHandler(400, "Country code already exist for this country");
  }
  const countryCodeName = await getCountryCodeByNameFromDb(input.countryCode);
  if (countryCodeName) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Country Code")
    );
  }
  logger.info("exiting::createCountryCode::service::validation");
};

export const updateCountryCodeValidation = async (input: UpdateCountryCode) => {
  logger.info("entering::updateCountryCode::service::validation");
  const existingCountryCode = await validateIdCountryCode(input.id);
  await validIdCountry(input.countryId);

  const countryCode = await getCountryCodeByCountryFromDb(input.countryId);
  if (countryCode && countryCode.id !== existingCountryCode.id) {
    throw new ErrorHandler(400, "Country code already exist for this country");
  }
  const countryCodeName = await getCountryCodeByNameFromDb(input.countryCode);
  if (countryCodeName && countryCodeName.id !== existingCountryCode.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Country Code")
    );
  }
  logger.info("exiting::updateCountryCode::service::validation");
};
