import {
  HospitalDTO,
  HospitalReq,
  HospitalResponse,
} from "@/types/master/hospital.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { HospitalDTOLocation } from "@/types/master/hospital.js";
import { checkIsCacheable } from "@/config/cache.config.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/bloodBank.shortCode.utils.js";
import { ToggleActive } from "av6-core-v2";
import {
  createHospitalServiceValidation,
  updateHospitalServiceValidation,
  validateHospitalId,
} from "@/validations/service/master/hospital.service.validation.js";
import {
  createHospitalInDb,
  getAllHospitalFromDb,
  getHospitalByIdFromDb,
  getHospitalsByCcIdsFromDb,
  toggleActiveHospital,
  updateHospitalInDb,
} from "@/repository/master/hospital.repository.js";
import {
  toHospitalDTO,
  toHospitalDTOLocation,
} from "@/mapper/master/hospital.mapper.js";
import { Hospital } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("HOSPITAL", "all");

export const hospitalService = {
  async createHospital(input: HospitalReq): Promise<HospitalDTO> {
    logger.info("entering::createHospital::service");
    await createHospitalServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.HOSPITAL);
    const hospital = await createHospitalInDb(input);
    if (isCacheable && hospital) {
      await addToCache(cacheKey, hospital.id, hospital);
    }
    const hospitalDTO = await toHospitalDTO([hospital]);
    logger.info("exiting::createHospital::service");
    return hospitalDTO[0];
  },

  async updateHospital(input: HospitalReq): Promise<HospitalDTO> {
    logger.info("entering::updateHospital::service");
    if (input.id === undefined) {
      throw new ErrorHandler(400, "ID is required for updating Hospital");
    }
    await updateHospitalServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.HOSPITAL);
    const updatedHospital = await updateHospitalInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedHospital);
    }

    logger.info("exiting::updateHospital::service");
    const updatedHospitalDTO = await toHospitalDTO([updatedHospital]);
    return updatedHospitalDTO[0];
  },

  async getAllHospital(
    canNullReturnable: boolean = false
  ): Promise<HospitalDTO[]> {
    logger.info("entering::getAllHospital::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.HOSPITAL);
    let hospital: HospitalResponse[];
    if (isCacheable) {
      hospital = (await getAllCache(cacheKey)) as HospitalResponse[];
    } else {
      hospital = await getAllHospitalFromDb();
    }
    if (hospital.length === 0) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Hospital")
        );
      else return [];
    }
    const hospitalDTO = await toHospitalDTO(hospital);
    logger.info("exiting::getAllHospital::service");
    return hospitalDTO;
  },

  async getHospitalById(
    hospitalId: number,
    canNullReturnable: boolean = false
  ): Promise<HospitalDTO | null> {
    logger.info("entering::getHospitalById::service");
    validIdCheck(hospitalId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.HOSPITAL);
    let hospital: HospitalResponse | null;
    let hospitalDTO = null;

    if (isCacheable) {
      hospital = (await getCacheById(
        cacheKey,
        hospitalId
      )) as HospitalResponse | null;

      if (hospital !== null) {
        hospitalDTO = await toHospitalDTO([hospital]);
      }
    } else {
      hospital = await getHospitalByIdFromDb(hospitalId);

      if (hospital !== null) {
        hospitalDTO = await toHospitalDTO([hospital]);
      }
    }

    if (!hospitalDTO) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Hospital")
        );
      else return null;
    }

    logger.info("exiting::getHospitalById::service");
    return hospitalDTO[0];
  },

  async getHospitalByIdWoDTO(
    hospitalId: number,
    canNullReturnable: boolean = false
  ): Promise<Hospital | null> {
    logger.info("entering::getHospitalById::service");
    validIdCheck(hospitalId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.HOSPITAL);
    let hospital: Hospital | null;

    if (isCacheable) {
      hospital = (await getCacheById(cacheKey, hospitalId)) as Hospital | null;
    } else {
      hospital = await getHospitalByIdFromDb(hospitalId);
    }

    if (!hospital) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Hospital")
        );
      else return null;
    }

    logger.info("exiting::getHospitalById::service");
    return hospital;
  },

  async toggleActiveHospital(input: ToggleActive): Promise<HospitalDTO> {
    logger.info("entering::reactivateHospital::service");
    await validateHospitalId(input.id);

    const isCacheable = await checkIsCacheable(SHORT_CODE.HOSPITAL);
    const updateHospital = await toggleActiveHospital(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updateHospital);
    }

    logger.info("exiting::reactivateHospital::service");
    const hospitalDTO = await toHospitalDTO([updateHospital]);
    return hospitalDTO[0];
  },

  async getHospitalsByCcIds(ccIds: number[]): Promise<HospitalDTO[]> {
    logger.info("entering::getHospitalsByCcIds::service");
    if (!ccIds.length) return [];

    const hospitals = await getHospitalsByCcIdsFromDb(ccIds);
    const dtos = await toHospitalDTO(hospitals);

    logger.info("exiting::getHospitalsByCcIds::service");
    return dtos;
  },

  async getHospitalsByCcIdsAsLocation(
    ccIds: number[]
  ): Promise<HospitalDTOLocation[]> {
    logger.info("entering::getHospitalsByCcIdsAsLocation::service");
    if (!ccIds.length) return [];

    const hospitals = await getHospitalsByCcIdsFromDb(ccIds);
    const dtos = await Promise.all(
      hospitals.map((w) => toHospitalDTOLocation(w))
    );

    logger.info("exiting::getHospitalsByCcIdsAsLocation::service");
    return dtos;
  },

  async getAllHospitalWoDto(
    canNullReturnable: boolean = false
  ): Promise<Hospital[]> {
    logger.info("entering::getAllHospital::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.HOSPITAL);
    let hospital: Hospital[];
    if (isCacheable) {
      hospital = (await getAllCache(cacheKey)) as Hospital[];
    } else {
      hospital = await getAllHospitalFromDb();
    }
    if (hospital.length === 0) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Hospital")
        );
      else return [];
    }
    logger.info("exiting::getAllHospitalWoDto::service");
    return hospital;
  },
};
