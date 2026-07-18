import {
  getCountryByCountryAlpha2CodeFromDb,
  getCountryByCountryAlpha3CodeFromDb,
  getCountryByCountryNameFromDb,
  getCountryByCountryShortNameFromDb,
  getCountryByIdFromDb,
} from "@/repository/master/country.repository.js";
import {
  CreateCountryInput,
  UpdateCountryInput,
} from "@/types/master/country.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { Country } from "@repo/db/generated/prisma/client";

export const validIdCountry = async (countryId: number) => {
  logger.info("entering::validIdCountry::service::validation");

  validIdCheck(countryId);

  const country = await getCountryByIdFromDb(countryId);
  if (!country) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Country"));
  }
  logger.info("exiting::validIdCountry::service::validation");

  return country;
};

export const deleteCountryServiceValidation = async (
  countryId: number,
): Promise<void> => {
  logger.info("entering::deleteCountryServiceValidation::service::validation");
  await validIdCountry(Number(countryId));

  logger.info("exiting::deleteCountryServiceValidation::service::validation");

  return;
};

export const getIdCountryServiceValidation = async (
  countryId: number,
): Promise<void> => {
  logger.info("entering::getIdCountryServiceValidation::service::validation");
  await validIdCountry(countryId);

  logger.info("exiting::getIdCountryServiceValidation::service::validation");
  return;
};

export const updateIdCountryServiceValidation = async (
  body: UpdateCountryInput,
): Promise<Country | null> => {
  logger.info(
    "entering::updateIdCountryServiceValidation::service::validation",
  );
  validIdCheck(body.id);

  const existingCountry = await getCountryByIdFromDb(body.id);
  if (!existingCountry) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Country"));
  }

  const countryWithSameNationality = await getCountryByCountryNameFromDb(
    body.nationality,
  );
  if (countryWithSameNationality) {
    if (countryWithSameNationality.id !== body.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Country nationality"),
      );
    }
  }

  const countryWithSameShortName = await getCountryByCountryShortNameFromDb(
    body.enShortName,
  );
  if (countryWithSameShortName) {
    if (countryWithSameShortName.id !== body.id) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Country Short Name"),
      );
    }
  }

  if (body.alpha2Code) {
    const countryWithSameAlpha2Code = await getCountryByCountryAlpha2CodeFromDb(
      body.alpha2Code,
    );
    if (countryWithSameAlpha2Code) {
      if (countryWithSameAlpha2Code.id !== body.id) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("DUPLICATE_ITEM", "Country Alpha2 Code"),
        );
      }
    }
  }

  if (body.alpha3Code) {
    const countryWithSameAlpha3Code = await getCountryByCountryAlpha3CodeFromDb(
      body.alpha3Code,
    );
    if (countryWithSameAlpha3Code) {
      if (countryWithSameAlpha3Code.id !== body.id) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("DUPLICATE_ITEM", "Country Alpha3 Code"),
        );
      }
    }
  }
  logger.info("exiting::updateIdCountryServiceValidation::service::validation");
  return null;
};

export const nameCountryServiceValidation = async (
  name: string,
): Promise<void> => {
  logger.info("entering::nameCountryServiceValidation::service::validation");
  const country = await getCountryByCountryNameFromDb(name);
  if (country) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Country"),
    );
  }
  logger.info("exiting::nameCountryServiceValidation::service::validation");
  return;
};

export const createCountryServiceValidation = async (
  body: CreateCountryInput,
) => {
  logger.info(
    "entering::createCountryServiceValidation::serviceVal::validation",
  );
  const countryNational = await getCountryByCountryNameFromDb(body.nationality);
  if (countryNational) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Country nationality"),
    );
  }

  const countryShortName = await getCountryByCountryShortNameFromDb(
    body.enShortName,
  );
  if (countryShortName) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Country Short Name"),
    );
  }

  if (body.alpha2Code) {
    const countryAlpha2Code = await getCountryByCountryAlpha2CodeFromDb(
      body.alpha2Code,
    );
    if (countryAlpha2Code) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Country Alpha2 Code"),
      );
    }
  }
  if (body.alpha3Code) {
    const countryAlpha3Code = await getCountryByCountryAlpha3CodeFromDb(
      body.alpha3Code,
    );
    if (countryAlpha3Code) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Country Alpha3 Code"),
      );
    }
  }

  logger.info("exiting::createCountryServiceValidation::service::validation");
};
