import {
  getCityByCityNameFromDb,
  getCityByIdFromDb,
} from "@/repository/master/city.repository.js";
import { getStateWithIncludesFromDB } from "@/repository/master/state.repository.js";
import { CreateCityInput, UpdateCityInput } from "@/types/master/city.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";

export const validIdCity = async (cityId: number): Promise<void> => {
  logger.info("entering::validIdCity::service::validation");

  validIdCheck(cityId);

  const city = await getCityByIdFromDb(cityId);
  if (!city || city.isActive === false) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "City"));
  }
  logger.info("exiting::validIdCity::service::validation");

  return;
};

export const deleteCityServiceValidation = async (
  cityId: number,
): Promise<void> => {
  logger.info("entering::deleteCityServiceValidation::service::validation");

  await validIdCity(cityId);

  logger.info("exiting::deleteCityServiceValidation::service::validation");

  return;
};

export const getIdCityServiceValidation = async (
  cityId: number,
): Promise<void> => {
  logger.info("entering::getIdCityServiceValidation::service::validation");

  await validIdCity(cityId);

  logger.info("exiting::getIdCityServiceValidation::service::validation");

  return;
};

export const updateIdCityServiceValidation = async (
  body: UpdateCityInput,
): Promise<void> => {
  logger.info("entering::updateIdCityServiceValidation::service::validation");
  await validIdCity(body.id);

  const cityByName = await getCityByCityNameFromDb(body.name, body.stateId);
  if (cityByName && cityByName.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "City Name"),
    );
  }
  logger.info("exiting::updateIdCityServiceValidation::service::validation");
  return;
};

export const createCityServiceValidation = async (
  body: CreateCityInput,
): Promise<void> => {
  logger.info("entering::createCityServiceValidation::service::validation");
  await validateCityForeignKeys(body);
  const city = await getCityByCityNameFromDb(body.name, body.stateId);
  if (city) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "City Name"),
    );
  }
  logger.info("exiting::createCityServiceValidation::service::validation");

  return;
};

export const validateCityForeignKeys = async (
  input: CreateCityInput,
): Promise<void> => {
  logger.info("entering::validateCityForeignKeys::service::validation");
  const state = await getStateWithIncludesFromDB(input.stateId);
  if (!state || state.countryId !== input.countryId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_FOREIGN_KEY", "City"),
    );
  }
  logger.info("exiting::validateCityForeignKeys::service::validation");
};
