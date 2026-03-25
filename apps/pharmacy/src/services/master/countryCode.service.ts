import { toCountryCodeDTO } from "@/mapper/master/countryCode.mapper.js";
import {
  createCountryCodeInDb,
  deleteCountryCodeByIdFromDb,
  getAllCountryCodeFromDb,
  getCountryCodeByIdFromDb,
  updateCountryCodeInDb,
} from "@/repository/master/countryCode.repository.js";
import {
  CountryCodeDTO,
  CreateCountryCode,
  UpdateCountryCode,
} from "@/types/master/countryCode.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  deleteCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import {
  createCountryCodeValidation,
  updateCountryCodeValidation,
  validateIdCountryCode,
} from "@/validations/service/master/countryCode.service.validation.js";
import { CountryCode } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("COUNTRY_CODE", "all");

export const countryCodeService = {
  async createCountryCode(input: CreateCountryCode): Promise<CountryCodeDTO> {
    logger.info("entering::createCountryCode::service");
    await createCountryCodeValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.COUNTRY_CODE);
    const countryCode = await createCountryCodeInDb(input);
    if (isCacheable && countryCode) {
      await addToCache(cacheKey, countryCode.id, countryCode);
    }
    logger.info("exiting::createCountryCode::service");
    return toCountryCodeDTO(countryCode);
  },
  async updateCountryCode(input: UpdateCountryCode): Promise<CountryCodeDTO> {
    logger.info("entering::updateCountryCode::service");
    await updateCountryCodeValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.COUNTRY_CODE);
    const countryCode = await updateCountryCodeInDb(input);
    if (isCacheable && countryCode) {
      await updateCache(cacheKey, countryCode.id, countryCode);
    }
    logger.info("exiting::updateCountryCode::service");
    return toCountryCodeDTO(countryCode);
  },
  async getAllCountryCode(): Promise<CountryCodeDTO[]> {
    logger.info("entering::getAllCountryCode::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.COUNTRY_CODE);
    if (isCacheable) {
      const cachedCountryCode = (await getAllCache(cacheKey)) as
        | CountryCode[]
        | null;
      if (cachedCountryCode && cachedCountryCode.length > 0) {
        return Promise.all(
          cachedCountryCode.map((countryCode) => toCountryCodeDTO(countryCode)),
        );
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Country Code"),
        );
      }
    } else {
      const countryCode = await getAllCountryCodeFromDb();
      if (countryCode.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Country Code"),
        );
      }
      logger.info("exiting::getAllCountryCode::service");
      return Promise.all(
        countryCode.map((countryCode) => toCountryCodeDTO(countryCode)),
      );
    }
  },
  async getCountryCodeById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<CountryCodeDTO | null> {
    logger.info("entering::getCountryCodeById::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.COUNTRY_CODE);
    let countryCode: CountryCode | null = null;
    if (isCacheable) {
      countryCode = (await getCacheById(cacheKey, id)) as CountryCode | null;
    } else {
      countryCode = await getCountryCodeByIdFromDb(id);
    }
    if (!countryCode) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Country Code"),
        );
      } else return null;
    }
    logger.info("exiting::getCountryCodeById::service");
    return toCountryCodeDTO(countryCode);
  },
  async deleteCountryCodeById(id: number) {
    logger.info("entering::deleteCountryCodeById::service");
    await validateIdCountryCode(id);
    await deleteCountryCodeByIdFromDb(id);
    await deleteCache(cacheKey, id);
    logger.info("exiting::deleteCountryCodeById::service");
  },
};
