import { toCollectionCenterDTO } from "@/mapper/staff/staffCollectionCenter.mapper.js";
import {
  createCollectionCenterInDb,
  updateCollectionCenterInDb,
  getAllCollectionCenterFromDb,
  getAvailableCollectionCenterFromDb,
  getCollectionCenterByIdFromDb,
} from "@/repository/master/collectionCenter.repository.js";
import { getCollectionCentersFromDb } from "@/repository/staff/staffCollectionCenter.repository.js";
import {
  CollectionCenterReq,
  CollectionCenterDTO,
} from "@/types/master/collectionCenter.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import {
  addToCache,
  updateCache,
  getAllCache,
  getCacheById,
} from "@repo/platform/cache/redis.utils.js";

import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/core.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createCollectionCenterServiceValidation,
  updateIdCollectionCenterServiceValidation,
} from "@/validations/service/master/collectionCenter.service.validation.js";
import { validateIdEmployee } from "@/validations/service/staff/employee.service.validation.js";
import { CollectionCenter } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { staffCollectionCenterService } from "../staff/staffCollectionCenter.service.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { auditProxy } from "@/config/audit.config.js";

const cacheKey = getRedisKey("COLLECTION_CENTER", "all");
const collectionCenterServiceRaw = {
  async createCollectionCenter(
    input: CollectionCenterReq
  ): Promise<CollectionCenter> {
    logger.info("entering::createCollectionCenter::service");
    await createCollectionCenterServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.COLLECTION_CENTER);
    const collectionCenter = await createCollectionCenterInDb(input);
    if (isCacheable && collectionCenter) {
      await addToCache(cacheKey, collectionCenter.id, collectionCenter);
    }
    logger.info("exiting::createCollectionCenter::service");
    return collectionCenter;
  },

  async updateCollectionCenter(
    input: CollectionCenterReq
  ): Promise<CollectionCenter> {
    logger.info("entering::updateCollectionCenter::service");
    if (input.id === undefined) {
      throw new ErrorHandler(
        400,
        "ID is required for updating Collection Center"
      );
    }
    await updateIdCollectionCenterServiceValidation(input.id, input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.COLLECTION_CENTER);
    const updatedCollectionCenter = await updateCollectionCenterInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updatedCollectionCenter);
    }

    logger.info("exiting::updateCollectionCenter::service");
    return updatedCollectionCenter;
  },

  async getAllCollectionCenter(): Promise<CollectionCenter[]> {
    logger.info("entering::getAllCollectionCenter::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.COLLECTION_CENTER);
    if (isCacheable) {
      const cachedCollectionCenter = (await getAllCache(cacheKey)) as
        | CollectionCenter[]
        | null;
      if (cachedCollectionCenter && cachedCollectionCenter.length > 0) {
        return cachedCollectionCenter;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Collection Center")
        );
      }
    } else {
      const collectionCenter = await getAllCollectionCenterFromDb();
      if (collectionCenter.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Collection Center")
        );
      }
      logger.info("exiting::getAllCollectionCenter::service");
      return collectionCenter;
    }
  },

  async getAvailableCollectionCenter(): Promise<CollectionCenter[]> {
    logger.info("entering::getAllCollectionCenter::service");

    const collectionCenter = await getAvailableCollectionCenterFromDb();
    if (collectionCenter.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Collection Center")
      );
    }
    logger.info("exiting::getAllCollectionCenter::service");
    return collectionCenter;
  },

  async getCollectionCenterById(
    collectionCenterId: number,
    canNullReturnable: boolean = false
  ): Promise<CollectionCenter | null> {
    logger.info("entering::getCollectionCenterById::service");
    validIdCheck(collectionCenterId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.COLLECTION_CENTER);
    let collectionCenter: CollectionCenter | null;
    if (isCacheable) {
      collectionCenter = (await getCacheById(
        cacheKey,
        collectionCenterId
      )) as CollectionCenter | null;
    } else {
      collectionCenter = await getCollectionCenterByIdFromDb(
        collectionCenterId
      );
    }
    if (!collectionCenter) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Collection Center")
        );
      else return null;
    }

    logger.info("exiting::getCollectionCenterById::service");
    return collectionCenter;
  },
  //Get all branch and warehouse
  async getCollectionCentersForStaff(
    staffId: number
  ): Promise<CollectionCenterDTO[]> {
    logger.info("entering::getCollectionCentersForStaff::service");

    await validateIdEmployee(staffId);

    // 1) Get mapped CC IDs for this staff
    const ccIds =
      await staffCollectionCenterService.getStaffCollectionCenterMapById(
        staffId
      ); // throws 404 if none
    const uniqueIds = Array.from(new Set(ccIds));

    // 2) Fetch CC rows
    const centers = await getCollectionCentersFromDb(uniqueIds as number[]);

    if (!centers || centers.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "collectionCenter")
      );
    }

    // 3) Map -> DTO
    const dto = centers.map(toCollectionCenterDTO);

    logger.info("exiting::getCollectionCentersForStaff::service");
    return dto;
  },
};

export const collectionCenterService = auditProxy.createAuditedService(
  "collectionCenter",
  collectionCenterServiceRaw
);
