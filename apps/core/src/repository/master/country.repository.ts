import { db } from "@repo/db/client";
import {
  CreateCountryInput,
  UpdateCountryInput,
} from "@/types/master/country.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Country } from "@repo/db/generated/prisma/client";
import { customOmit } from "av6-utils";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";

export const createCountryInDb = async (
  country: CreateCountryInput
): Promise<Country> => {
  logger.info("entering::createCountry::repository");
  return db.country.create({
    data: country,
  });
};

export const getAllCountriesFromDb = async (): Promise<Country[]> => {
  logger.info("entering::getAllCountries::repository");
  return db.country.findMany();
};

export const getCountryByIdFromDb = async (
  id: number
): Promise<Country | null> => {
  logger.info("entering::getCountryById::repository");
  return db.country.findUnique({
    where: { id },
  });
};

export const getCountryByCountryNameFromDb = async (
  nationality: string
): Promise<Country | null> => {
  logger.info("entering::getCountryByCountryName::repository");
  return db.country.findFirst({
    where: { nationality: nationality },
  });
};
export const getCountryByCountryShortNameFromDb = async (
  shortName: string
): Promise<Country | null> => {
  logger.info("entering::getCountryByCountryName::repository");
  return db.country.findFirst({
    where: { enShortName: shortName },
  });
};

export const getCountryByCountryAlpha2CodeFromDb = async (
  alpha2Code: string
): Promise<Country | null> => {
  logger.info("entering::getCountryByCountryName::repository");
  return db.country.findFirst({
    where: { alpha2Code: alpha2Code },
  });
};

export const getCountryByCountryAlpha3CodeFromDb = async (
  alpha3Code: string
): Promise<Country | null> => {
  logger.info("entering::getCountryByCountryName::repository");
  return db.country.findFirst({
    where: { alpha3Code: alpha3Code },
  });
};

export const updateCountryInDb = async (
  country: UpdateCountryInput
): Promise<Country> => {
  logger.info("entering::updateCountry::repository");
  const omitted = customOmit<UpdateCountryInput, "id">(country, ["id"]);
  return db.country.update({
    where: { id: country.id! },
    data: { ...omitted.rest },
  });
};

// export const updateActiveCountryInDb = async (numCode: number): Promise<Country> => {
//   logger.info("entering::updateCountry::repository");
//   return db.country.update({
//     where: { numCode },

//   });
// };

export const deleteCountryInDb = async (id: number): Promise<void> => {
  logger.info("Entering::deleteCountryInDb::repository");

  try {
    await db.country.delete({
      where: { id },
    });
  } catch (error) {
    logger.error(
      `Error deleting country with numCode=${id}: ${JSON.stringify(error)}`
    );
    throw new ErrorHandler(404, "Failed to delete country. It may be in use.");
  }
};
