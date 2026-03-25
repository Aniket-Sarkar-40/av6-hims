import {
  toBranchDTO,
  toItemBranchMapBranchDTO,
} from "@/mapper/master/branch.mapper.js";
import {
  createBranchInDb,
  getAllBranchFromDb,
  getAllBranchIdOfItemBranchMapFromDb,
  getBranchByIdFromDb,
  toggleActiveBranch,
  updateBranchInDb,
} from "@/repository/master/branch.repository.js";
import { BranchDropDown, BranchDTO, BranchReq } from "@/types/master/branch.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createBranchServiceValidation,
  updateIdBranchServiceValidation,
  validateIdBranch,
} from "@/validations/service/master/branch.service.validation.js";
import { PmsBranch } from "@repo/db/generated/prisma/client";
import { ToggleActive } from "av6-core";

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
    if (isCacheable) {
      const cachedBranch = (await getAllCache(cacheKey)) as PmsBranch[];
      if (cachedBranch && cachedBranch.length > 0) {
        return await Promise.all(
          cachedBranch.map((branch) => toBranchDTO(branch)),
        );
      } else {
        if (!canNullReturnable)
          throw new ErrorHandler(
            404,
            generateErrorMessage("NOT_FOUND", "Branch"),
          );
        else return [];
      }
    } else {
      const branch = await getAllBranchFromDb();

      const branchDTO = await Promise.all(
        branch.map((branch) => toBranchDTO(branch)),
      );

      if (branchDTO.length === 0 && !canNullReturnable) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Branch"),
        );
      }
      logger.info("exiting::getAllBranch::service");
      return branchDTO;
    }
  },

  async getAllBranchWoDTO(): Promise<PmsBranch[]> {
    logger.info("entering::getAllBranch::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.BRANCH);
    if (isCacheable) {
      const cachedBranch = (await getAllCache(cacheKey)) as PmsBranch[];
      return cachedBranch;
    } else {
      const branches = await getAllBranchFromDb();
      logger.info("exiting::getAllBranch::service");
      return branches;
    }
  },

  async getBranchById(
    branchId: number,
    canNullReturnable: boolean = false,
  ): Promise<BranchDTO | null> {
    logger.info("entering::getBranchById::service");
    validIdCheck(branchId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.BRANCH);
    let branch: PmsBranch | null;
    if (isCacheable) {
      branch = (await getCacheById(cacheKey, branchId)) as PmsBranch | null;
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
  ): Promise<PmsBranch | null> {
    logger.info("entering::getBranchById::service");
    validIdCheck(branchId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.BRANCH);
    let branch: PmsBranch | null;
    if (isCacheable) {
      branch = (await getCacheById(cacheKey, branchId)) as PmsBranch | null;
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

  async getAllBranchFromItemBranchMap(): Promise<BranchDropDown[]> {
    logger.info("entering::getAllBranchFromItemBranchMap::service");
    const data = await getAllBranchIdOfItemBranchMapFromDb();
    logger.info("exiting::getAllBranchFromItemBranchMap::service");

    return await Promise.all(data.map((id) => toItemBranchMapBranchDTO(id)));
  },
};
