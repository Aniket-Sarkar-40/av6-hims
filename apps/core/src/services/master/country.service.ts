import { toCountryDto } from "@/mapper/master/country.mapper.js";
import {
  createCountryInDb,
  getAllCountriesFromDb,
  getCountryByIdFromDb,
  updateCountryInDb,
  deleteCountryInDb,
} from "@/repository/master/country.repository.js";
import {
  CreateCountryInput,
  CountryDTO,
  UpdateCountryInput,
} from "@/types/master/country.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
  deleteCache,
} from "@repo/platform/cache/redis.utils.js";
import { getMasterRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/core.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createCountryServiceValidation,
  updateIdCountryServiceValidation,
  deleteCountryServiceValidation,
} from "@/validations/service/master/country.service.validation.js";
import { Country } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { checkIsCacheable } from "@/config/cache.config.js";
import { auditProxy } from "@/config/audit.config.js";

const cacheKey = getMasterRedisKey("COUNTRY", "all");

const countryServiceRaw = {
  async createCountry(input: CreateCountryInput): Promise<CountryDTO> {
    logger.info("entering::createCountry::service");
    await createCountryServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.COUNTRY);

    const country = await createCountryInDb(input);

    if (isCacheable && country) {
      await addToCache(cacheKey, country.id, country);
    }
    logger.info("exiting::createCountry::service");
    const dtoCountry: CountryDTO = await toCountryDto(country);
    return dtoCountry;
  },

  async getAllCountries(): Promise<CountryDTO[]> {
    logger.info("entering::getAllCountries::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.COUNTRY);
    if (isCacheable) {
      const cachedCountries = (await getAllCache(cacheKey)) as Country[] | null;

      if (cachedCountries && cachedCountries.length > 0) {
        const cachedCountryDTOs: CountryDTO[] = await Promise.all(
          cachedCountries.map(toCountryDto)
        );
        return cachedCountryDTOs;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Countries")
        );
      }
    } else {
      const countries = await getAllCountriesFromDb();
      if (countries.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Countries")
        );
      }
      const countryDTOs: CountryDTO[] = await Promise.all(
        countries.map(toCountryDto)
      );
      logger.info("exiting::getAllCountries::service");
      return countryDTOs;
    }
  },

  async getCountryById(
    countryId: number,
    canNullReturnable: boolean = false
  ): Promise<CountryDTO | null> {
    logger.info("entering::getCountryById::service");
    validIdCheck(countryId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.COUNTRY);
    let country: Country | null;
    if (isCacheable) {
      country = (await getCacheById(cacheKey, countryId)) as Country | null;
    } else {
      country = await getCountryByIdFromDb(countryId);
    }
    if (country === null) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Country")
        );
      else return null;
    }
    logger.info("exiting::getCountryById::service");
    const dtoCountry: CountryDTO = await toCountryDto(country);
    return dtoCountry;
  },

  async updateCountry(input: UpdateCountryInput): Promise<CountryDTO> {
    logger.info("entering::updateCountry::service");
    await updateIdCountryServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.COUNTRY);
    const updatedCountry = await updateCountryInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, {
        ...updatedCountry,
        id: input.id,
      });
      logger.info("Updated country in cache for ID: " + input.id);
    }
    logger.info("exiting::updateCountry::service");
    const dtoUpdateCountry: CountryDTO = await toCountryDto(updatedCountry);
    return dtoUpdateCountry;
  },

  async deleteCountry(countryId: number): Promise<{ message: string }> {
    logger.info("entering::deleteCountry::service");
    await deleteCountryServiceValidation(countryId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.COUNTRY);
    await deleteCountryInDb(countryId);
    if (isCacheable) {
      await deleteCache(cacheKey, countryId);
    }
    logger.info("exiting::deleteCountry::service");
    return { message: "Country deleted successfully" };
  },
};

export const countryService = auditProxy.createAuditedService(
  "country",
  countryServiceRaw
);
