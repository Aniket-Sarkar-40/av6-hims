import { toBranchOrWarehouseDto } from "@/mapper/master/collectionCenter.mapper.js";
import {
  createCollectionCenterInDb,
  getAllCollectionCenterFromDb,
  getAvailableCollectionCenterFromDb,
  getCollectionCenterByIdFromDb,
  updateCollectionCenterInDb,
} from "@/repository/master/collectionCenter.repository.js";
import {
  BranchOrWarehouseDTO,
  CollectionCenterReq,
} from "@/types/master/collectionCenter.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createCollectionCenterServiceValidation,
  updateIdCollectionCenterServiceValidation,
} from "@/validations/service/master/collectionCenter.service.validation.js";
import { validateIdEmployee } from "@/validations/service/staff/employee.service.validation.js";
import { CollectionCenter } from "@repo/db/generated/prisma/client";
import { staffCollectionCenterService } from "../staff/staffCollectionCenter.service.js";
import { branchService } from "./branch.service.js";
import { warehouseService } from "./warehouse.service.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";

const cacheKey = getRedisKey("COLLECTION_CENTER", "all");

export const collectionCenterService = {
  async createCollectionCenter(
    input: CollectionCenterReq,
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
    input: CollectionCenterReq,
  ): Promise<CollectionCenter> {
    logger.info("entering::updateCollectionCenter::service");
    if (input.id === undefined) {
      throw new ErrorHandler(
        400,
        "ID is required for updating Collection Center",
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
          generateErrorMessage("NOT_FOUND", "Collection Center"),
        );
      }
    } else {
      const collectionCenter = await getAllCollectionCenterFromDb();
      if (collectionCenter.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Collection Center"),
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
        generateErrorMessage("NOT_FOUND", "Collection Center"),
      );
    }
    logger.info("exiting::getAllCollectionCenter::service");
    return collectionCenter;
  },

  async getCollectionCenterById(
    collectionCenterId: number,
    canNullReturnable: boolean = false,
  ): Promise<CollectionCenter | null> {
    logger.info("entering::getCollectionCenterById::service");
    validIdCheck(collectionCenterId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.COLLECTION_CENTER);
    let collectionCenter: CollectionCenter | null;
    if (isCacheable) {
      collectionCenter = (await getCacheById(
        cacheKey,
        collectionCenterId,
      )) as CollectionCenter | null;
    } else {
      collectionCenter =
        await getCollectionCenterByIdFromDb(collectionCenterId);
    }
    if (!collectionCenter) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Collection Center"),
        );
      else return null;
    }

    logger.info("exiting::getCollectionCenterById::service");
    return collectionCenter;
  },
  //Get all branch and warehouse
  async getAllBranchAndWarehouse(
    staffId: number,
  ): Promise<BranchOrWarehouseDTO[]> {
    logger.info("entering::getAllCollectionCenter::service");
    await validateIdEmployee(staffId);
    const ccIds: number[] =
      await staffCollectionCenterService.getStaffCollectionCenterMapById(
        staffId,
      );

    const branch = await branchService.getAllBranch(true);
    const warehouse = await warehouseService.getAllWarehouse(true);
    const filteredBranch = branch?.filter((b) => ccIds.includes(b.id)) ?? [];
    const filteredWarehouse =
      warehouse?.filter((w) => ccIds.includes(w.id)) ?? [];

    if (filteredBranch.length === 0 && filteredWarehouse.length === 0) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Branch and Warehouse"),
      );
    }

    logger.info("exiting::getAllCollectionCenter::service");
    return toBranchOrWarehouseDto(filteredBranch, filteredWarehouse);
  },
};
