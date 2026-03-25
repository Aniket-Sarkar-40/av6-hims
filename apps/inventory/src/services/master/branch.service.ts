import { toBranchDTO } from "@/mapper/master/branch.mapper.js";
import {
  createBranchInDb,
  getAllBranchFromDb,
  getBranchByIdFromDb,
  toggleActiveBranch,
  updateBranchInDb,
  getBranchesByCcIdsFromDb,
  getCollectionCenterByIdFromDb,
} from "@/repository/master/branch.repository.js";
import { ToggleActive } from "@/types/common.js";
import { BranchDTO, BranchReq, BranchResponse } from "@/types/master/branch.js";
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
import { SHORT_CODE } from "@repo/shared/utils/shortCode/inventory.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createBranchServiceValidation,
  updateIdBranchServiceValidation,
  validateIdBranch,
} from "@/validations/service/master/branch.service.validation.js";
import { InvBranch, CollectionCenter } from "@repo/db/generated/prisma/client";
import { BranchDTOLocation } from "@/types/master/branch.js";
import { toBranchDTOLocation } from "@/mapper/master/branch.mapper.js";
import { checkIsCacheable } from "@/config/cache.config.js";

const cacheKey = getRedisKey("BRANCH", "all");

export const branchService = {
  async createBranch(input: BranchReq): Promise<BranchDTO> {
    logger.info("entering::createBranch::service");
    await createBranchServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.BRANCH);
    const branch = await createBranchInDb(input);
    if (isCacheable && branch) {
      await addToCache(cacheKey, branch.id, branch);
    }
    logger.info("exiting::createBranch::service");
    const branchDTO = await toBranchDTO(branch);
    return branchDTO;
  },

  async updateBranch(input: BranchReq): Promise<BranchDTO> {
    logger.info("entering::updateBranch::service");
    if (input.id === undefined) {
      throw new ErrorHandler(400, "ID is required for updating Branch");
    }
    await updateIdBranchServiceValidation(input.id, input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.BRANCH);
    const updateBranch = await updateBranchInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updateBranch);
    }

    logger.info("exiting::updateBranch::service");
    const branchDTO = await toBranchDTO(updateBranch);
    return branchDTO;
  },

  async getAllBranch(canNullReturnable: boolean = false): Promise<BranchDTO[]> {
    logger.info("entering::getAllBranch::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.BRANCH);
    let branch: BranchResponse[];
    if (isCacheable) {
      branch = (await getAllCache(cacheKey)) as BranchResponse[];
    } else {
      branch = await getAllBranchFromDb();
    }
    if (branch.length === 0) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Branch"),
        );
      else return [];
    }
    const branchDTO = await Promise.all(
      branch.map((branch) => toBranchDTO(branch)),
    );
    logger.info("exiting::getAllBranch::service");
    return branchDTO;
  },

  async getBranchById(
    branchId: number,
    canNullReturnable: boolean = false,
  ): Promise<BranchDTO | null> {
    logger.info("entering::getBranchById::service");
    validIdCheck(branchId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.BRANCH);
    let branch: BranchResponse | null;
    if (isCacheable) {
      branch = (await getCacheById(
        cacheKey,
        branchId,
      )) as BranchResponse | null;
    } else {
      branch = await getBranchByIdFromDb(branchId);
    }
    if (!branch) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Branch"),
        );
      else return null;
    }
    const branchDTO = await toBranchDTO(branch);
    logger.info("exiting::getBranchById::service");
    return branchDTO;
  },

  async getBranchByIdWoDTO(
    branchId: number,
    canNullReturnable: boolean = false,
  ): Promise<InvBranch | null> {
    logger.info("entering::getBranchById::service");
    validIdCheck(branchId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.BRANCH);
    let branch: InvBranch | null;
    if (isCacheable) {
      branch = (await getCacheById(cacheKey, branchId)) as InvBranch | null;
    } else {
      branch = await getBranchByIdFromDb(branchId);
    }

    if (!branch) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Branch"),
        );
      else return null;
    }

    logger.info("exiting::getBranchById::service");
    return branch;
  },

  async toggleActiveBranch(input: ToggleActive): Promise<BranchDTO> {
    logger.info("entering::reactivateBranch::service");
    await validateIdBranch(input.id);

    const isCacheable = await checkIsCacheable(SHORT_CODE.BRANCH);
    const updateBranch = await toggleActiveBranch(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id, updateBranch);
    }

    logger.info("exiting::reactivateBranch::service");
    const branchDTO = await toBranchDTO(updateBranch);
    return branchDTO;
  },

  async getBranchesByCcIds(ccIds: number[]): Promise<BranchDTO[]> {
    logger.info("entering::getBranchesByCcIds::service");
    if (!ccIds.length) return [];

    const branches = await getBranchesByCcIdsFromDb(ccIds);
    const dtos = await Promise.all(branches.map((b) => toBranchDTO(b)));

    logger.info("exiting::getBranchesByCcIds::service");
    return dtos;
  },

  async getBranchesByCcIdsAsLocation(
    ccIds: number[],
  ): Promise<BranchDTOLocation[]> {
    logger.info("entering::getBranchesByCcIdsAsLocation::service");
    if (!ccIds.length) return [];

    const branches = await getBranchesByCcIdsFromDb(ccIds);
    const dtos = await Promise.all(branches.map((b) => toBranchDTOLocation(b)));

    logger.info("exiting::getBranchesByCcIdsAsLocation::service");
    return dtos;
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
        getRedisKey("COLLECTION_CENTER", "all"),
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
};
