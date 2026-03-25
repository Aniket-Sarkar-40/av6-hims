import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import {
  addToCache,
  deleteCache,
  getAllCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { StaffDesignation } from "@repo/db/generated/prisma/client";

import {
  createStaffDesignationInDb,
  deleteStaffDesignationInDb,
  getAllDesignationsFromDb,
  getStaffDesignationByIdFromDb,
  updateStaffDesignationInDb,
} from "@/repository/staff/designation.repository.js";
import { CreateStaffDesignationInput } from "@/types/staff/designation.js";
import { logger } from "@repo/platform/logging/logger.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import {
  createStaffDesignationServiceValidation,
  updateStaffDesignationServiceValidation,
  validateIdStaffDesignation,
} from "@/validations/service/staff/designation.service.validation.js";
import { getRedisKey } from "@/config/cache.config.js";

const cacheKey = getRedisKey("STAFF_DESIGNATION", "all");

export const staffDesignationService = {
  async createStaffDesignation(
    input: CreateStaffDesignationInput,
  ): Promise<StaffDesignation> {
    logger.info("entering::createDesignations::service");
    await createStaffDesignationServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.DESIGNATION);
    const staffDesignation = await createStaffDesignationInDb(input);
    if (isCacheable && staffDesignation) {
      await addToCache(cacheKey, staffDesignation.id, staffDesignation);
    }
    logger.info("exiting::createDesignations::service");
    return staffDesignation;
  },

  async getAllDesignations(): Promise<StaffDesignation[]> {
    logger.info("entering::getAllDesignations::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.DESIGNATION);
    if (isCacheable) {
      const cachedDesignations = (await getAllCache(cacheKey)) as
        | StaffDesignation[]
        | null;
      if (cachedDesignations && cachedDesignations.length > 0) {
        return cachedDesignations;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Designations"),
        );
      }
    } else {
      const staffDesignation = await getAllDesignationsFromDb();
      if (staffDesignation.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Designations"),
        );
      }
      logger.info("exiting::getAllDesignations::service");
      return staffDesignation;
    }
  },

  async getStaffDesignationById(
    staffDesignationId: number,
    canNullReturnable: boolean = false,
  ): Promise<StaffDesignation | null> {
    logger.info("entering::getStaffDesignationById::service");
    validIdCheck(staffDesignationId);
    // Try to get from cache first
    const isCacheable = await checkIsCacheable(SHORT_CODE.DESIGNATION);
    let staffDesignation: Promise<StaffDesignation | null> | null;
    if (isCacheable) {
      staffDesignation = (await getCacheById(
        cacheKey,
        staffDesignationId,
      )) as Promise<StaffDesignation | null>;
    } else {
      staffDesignation = (await getStaffDesignationByIdFromDb(
        staffDesignationId,
      )) as Promise<StaffDesignation | null> | null;
    }
    if (staffDesignation === null) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "StaffDesignation"),
        );
      else return null;
    }
    logger.info("exiting::getStaffDesignationById::service");
    return staffDesignation;
  },

  async updateStaffDesignation(
    staffDesignationId: number,
    input: CreateStaffDesignationInput,
  ): Promise<StaffDesignation> {
    logger.info("entering::updateStaffDesignation::service");
    await updateStaffDesignationServiceValidation(input, staffDesignationId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.DESIGNATION);
    const updatedStaffDesignation = await updateStaffDesignationInDb(
      staffDesignationId,
      input,
    );
    if (isCacheable) {
      await updateCache(cacheKey, staffDesignationId, updatedStaffDesignation);
    }
    logger.info("exiting::updateStaffDesignation::service");
    return updatedStaffDesignation;
  },

  async deleteStaffDesignation(
    staffDesignationId: number,
  ): Promise<{ message: string }> {
    logger.info("entering::deleteStaffDesignation::service");
    await validateIdStaffDesignation(staffDesignationId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.DESIGNATION);
    await deleteStaffDesignationInDb(staffDesignationId);
    if (isCacheable) {
      await deleteCache(cacheKey, staffDesignationId);
    }
    logger.info("exiting::deleteStaffDesignation::service");
    return { message: "staffDesignation deleted successfully" };
  },
};
