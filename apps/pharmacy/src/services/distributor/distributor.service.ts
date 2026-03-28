import {
  toDistributorDetailsDto,
  toDistributorDto,
} from "@/mapper/distributor/distributor.mapper.js";
import {
  createDistributor,
  deleteDistributorDb,
  getAllDistributors,
  getDistributorByIdWoDto,
  updateDistributorDb,
} from "@/repository/distributor/distributor.repository.js";
import {
  CreateDistributorInput,
  DistributorResponse,
  UpdateDistributorInput,
} from "@/types/distributor/distributor.js";
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
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createDistributorServiceValidation,
  updateDistributorServiceValidation,
  validateIdDistributor,
} from "@/validations/service/distributor/distributor.service.validation.js";
import { Distributor } from "@repo/db/generated/prisma/client";
import { deleteFileIfExists } from "@repo/platform/middlewares/imageUpload.middleware.js";

const cacheKey = getRedisKey("DISTRIBUTOR", "all");

const deleteOldDistributorImageFiles = (distributor: Distributor) => {
  deleteFileIfExists(process.cwd() + distributor.distAgreementDoc);
  deleteFileIfExists(process.cwd() + distributor.distDrugDoc);
  deleteFileIfExists(process.cwd() + distributor.distGhanaDoc);
  deleteFileIfExists(process.cwd() + distributor.distLicDocument);
  deleteFileIfExists(process.cwd() + distributor.distLicNumber);
};

export const distributorService = {
  async createDistributor(input: CreateDistributorInput): Promise<Distributor> {
    logger.info("entering::createDistributor::service");
    await createDistributorServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.DISTRIBUTOR);
    const distributor = await createDistributor(input);

    if (isCacheable && distributor) {
      await addToCache(cacheKey, distributor.id, distributor);
    }
    logger.info("exiting::createDistributor::service");
    const distributorDto = toDistributorDto(distributor);

    return distributorDto;
  },

  async updateDistributorService(
    input: UpdateDistributorInput,
  ): Promise<Distributor> {
    logger.info("entering::updateDistributorService::service");

    // 1) Validate input
    const oldDistributor = await updateDistributorServiceValidation(input);

    // 2) Delete old image files from disk
    deleteOldDistributorImageFiles(oldDistributor);

    // 3) Update new distributor
    const distributor = await updateDistributorDb(Number(input.id), input);

    // 4) Update new distributor in cache
    const isCacheable = await checkIsCacheable(SHORT_CODE.DISTRIBUTOR);

    if (isCacheable && distributor) {
      await updateCache(cacheKey, distributor.id, distributor);
    }
    logger.info("exiting::updateDistributorService::service");
    const distributorDto = toDistributorDto(distributor);

    return distributorDto;
  },

  async getAllDistributor(): Promise<Distributor[]> {
    logger.info("entering::getAllDistributor::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.DISTRIBUTOR);

    if (isCacheable) {
      const cachedDistributor = (await getAllCache(cacheKey)) as
        | Distributor[]
        | null;
      if (cachedDistributor && cachedDistributor.length > 0) {
        const cachedDistributorDto = cachedDistributor.map(
          (distributor: Distributor) => toDistributorDto(distributor),
        );
        return cachedDistributorDto;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Distributor"),
        );
      }
    } else {
      const distributors = await getAllDistributors();
      if (distributors.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Distributor"),
        );
      }
      const distributorDto = distributors.map((distributor: Distributor) =>
        toDistributorDto(distributor),
      );
      logger.info("exiting::getAllDistributor::service");
      return distributorDto;
    }
  },

  async getDistributorByIdWoDto(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<Distributor | null> {
    logger.info("entering::getDistributorByIdWoDto::service");

    validIdCheck(id);

    const isCacheable = await checkIsCacheable(SHORT_CODE.DISTRIBUTOR);
    let distributor: Distributor | null;
    if (isCacheable) {
      distributor = (await getCacheById(cacheKey, id)) as Distributor | null;
    } else {
      distributor = await getDistributorByIdWoDto(id);
    }

    if (!distributor) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Distributor"),
        );
      } else return null;
    }

    const dto = toDistributorDto(distributor);
    logger.info("exiting::getDistributorByIdWoDto::service");
    return dto;
  },

  async getDistributorWoDto(
    canNullReturnable: boolean = false,
  ): Promise<Distributor[]> {
    logger.info("entering::getDistributorByIdWoDto::service");

    const isCacheable = await checkIsCacheable(SHORT_CODE.DISTRIBUTOR);
    let distributor: Distributor[] | null;
    if (isCacheable) {
      distributor = (await getAllCache(cacheKey)) as Distributor[] | [];
    } else {
      distributor = await getAllDistributors();
    }

    if (!distributor) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Distributor"),
        );
      } else return [];
    }

    logger.info("exiting::getDistributorByIdWoDto::service");
    return distributor;
  },

  async getDistributorById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<DistributorResponse | null> {
    logger.info("entering::getDistributorById::service");

    validIdCheck(id);

    const isCacheable = await checkIsCacheable(SHORT_CODE.DISTRIBUTOR);
    let distributor: Distributor | null;
    if (isCacheable) {
      distributor = (await getCacheById(cacheKey, id)) as Distributor | null;
    } else {
      distributor = await getDistributorByIdWoDto(id);
    }

    if (!distributor) {
      if (!canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Distributor"),
        );
      } else return null;
    }

    const dto = toDistributorDetailsDto(distributor);
    logger.info("exiting::getDistributorByIdWoDto::service");
    return dto;
  },
  async deleteDistributor(id: number): Promise<void> {
    logger.info("entering::deleteDistributor::service");
    // 1) Validate id
    const oldDistributor = await validateIdDistributor(id);

    // 2) Delete old image files from disk
    deleteOldDistributorImageFiles(oldDistributor);

    // 3) Delete distributor from DB
    await deleteDistributorDb(Number(id));

    const isCacheable = await checkIsCacheable(SHORT_CODE.DISTRIBUTOR);

    if (isCacheable) {
      await deleteCache(cacheKey, id);
    }
    logger.info("exiting::deleteDistributor::service");
  },
};
