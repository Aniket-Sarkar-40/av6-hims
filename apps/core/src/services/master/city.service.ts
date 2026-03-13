import {
  toCityDTOOnlyForCity,
  toCityDTO,
} from "@/mapper/master/city.mapper.js";
import {
  createCityInDb,
  getAllCitiesFromDb,
  getCityByIdFromDb,
  updateCityInDb,
  deleteCityInDb,
} from "@/repository/master/city.repository.js";
import {
  CreateCityInput,
  CityDTOForCity,
  CityDTO,
  UpdateCityInput,
} from "@/types/master/city.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
  deleteCache,
} from "@repo/platform/cache/redis.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/core.shortCode.utils.js";
import {
  createCityServiceValidation,
  updateIdCityServiceValidation,
  deleteCityServiceValidation,
} from "@/validations/service/master/city.service.validation.js";
import { City } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { checkIsCacheable, getMasterRedisKey } from "@/config/cache.config.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { auditProxy } from "@/config/audit.config.js";

const cacheKey = getMasterRedisKey("CITY", "all");

const cityServiceRaw = {
  async createCity(input: CreateCityInput): Promise<CityDTOForCity> {
    logger.info("entering::createCity::service");
    await createCityServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.CITY);
    const city = await createCityInDb(input);
    if (isCacheable && city) {
      await addToCache(cacheKey, city.id, city);
    }
    const CityDTOForCity = toCityDTOOnlyForCity(city);
    logger.info("exiting::createCity::service");
    return CityDTOForCity;
  },

  async getAllCities(): Promise<CityDTOForCity[]> {
    logger.info("entering::getAllCities::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.CITY);
    if (isCacheable) {
      const cachedCities = (await getAllCache(cacheKey)) as City[] | null;
      if (cachedCities && cachedCities.length > 0) {
        const cityDTOS = await Promise.all(
          cachedCities.map((city) => toCityDTOOnlyForCity(city))
        );
        return cityDTOS;
      }
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "States"));
    } else {
      const cities = await getAllCitiesFromDb();

      if (cities.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Cities")
        );
      }
      const cityDTOS = await Promise.all(
        cities.map((city) => toCityDTOOnlyForCity(city))
      );
      logger.info("exiting::getAllCities::service");
      return cityDTOS;
    }
  },

  async getCityById(
    cityId: number,
    canNullReturnable: boolean = false
  ): Promise<CityDTO | null> {
    logger.info("entering::getCityById::service");
    validIdCheck(cityId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.CITY);
    let city: City | null;
    if (isCacheable) {
      city = (await getCacheById(cacheKey, cityId)) as City | null;
    } else {
      city = await getCityByIdFromDb(cityId);
    }
    if (!city) {
      if (!canNullReturnable)
        throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "City"));
      else return null;
    }
    const CityDto = await toCityDTO(city);
    logger.info("exiting::getCityById::service");
    return CityDto;
  },

  async updateCity(input: UpdateCityInput): Promise<CityDTOForCity> {
    logger.info("entering::updateCity::service");
    await updateIdCityServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.CITY);
    const updatedCity = await updateCityInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedCity);
    }
    const cityDto = toCityDTOOnlyForCity(updatedCity);
    logger.info("exiting::updateCity::service");
    return cityDto;
  },

  async deleteCity(cityId: number): Promise<{ message: string }> {
    logger.info("entering::deleteCity::service");
    await deleteCityServiceValidation(cityId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.CITY);
    await deleteCityInDb(cityId);
    if (isCacheable) {
      await deleteCache(cacheKey, cityId);
    }
    logger.info("exiting::deleteCity::service");
    return { message: "city deleted successfully" };
  },
};

export const cityService = auditProxy.createAuditedService(
  "city",
  cityServiceRaw
);
