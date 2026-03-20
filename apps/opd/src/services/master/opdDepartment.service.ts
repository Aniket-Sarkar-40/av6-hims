import { toOpdDepartmentDTO } from "@/mapper/master/opdDepartment.mapper.js";
import {
  createOpdDepartmentInDb,
  getOpdDepartmentByIdFromDb,
  updateOpdDepartmentInDb,
} from "@/repository/master/opdDepartment.repository.js";
import {
  CreateOrUpdateOpdDepartment,
  OpdDepartmentDTO,
} from "@/types/master/opdDepartment.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/opd.shortCode.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  createOpdDepartmentServiceValidation,
  updateIdOpdDepartmentServiceValidation,
} from "@/validations/service/master/opdDepartment.service.validation.js";
import { OpdDepartment } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("OPD_DEPARTMENT", "all");

export const opdDepartmentService = {
  async createOpdDepartment(
    input: CreateOrUpdateOpdDepartment,
  ): Promise<OpdDepartmentDTO> {
    logger.info("entering::createOpdDepartment::service");

    await createOpdDepartmentServiceValidation(input);

    const isCacheable = await checkIsCacheable(SHORT_CODE.OPD_DEPARTMENT);

    const created = await createOpdDepartmentInDb(input);

    if (isCacheable) {
      await addToCache(cacheKey, created.id, created);
    }

    logger.info("exiting::createOpdDepartment::service");
    return toOpdDepartmentDTO(created);
  },

  async getOpdDepartmentById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<OpdDepartmentDTO | null> {
    logger.info("entering::getOpdDepartmentById::service");
    // await getIdOpdDepartmentServiceValidation(id);
    validIdCheck(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.OPD_DEPARTMENT);
    let row: OpdDepartment | null = null;

    if (isCacheable) {
      row = (await getCacheById(cacheKey, id)) as OpdDepartment | null;
    } else {
      row = await getOpdDepartmentByIdFromDb(id);
    }

    if (!row) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Opd Department"),
        );
      else return null;
    }

    logger.info("exiting::getOpdDepartmentById::service");
    return toOpdDepartmentDTO(row);
  },
  async getOpdDepartmentByIdWithOutDto(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<OpdDepartment | null> {
    logger.info("entering::getOpdDepartmentById::service");
    // await getIdOpdDepartmentServiceValidation(id);
    validIdCheck(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.OPD_DEPARTMENT);
    let row: OpdDepartment | null = null;

    if (isCacheable) {
      row = (await getCacheById(cacheKey, id)) as OpdDepartment | null;
    } else {
      row = await getOpdDepartmentByIdFromDb(id);
    }

    if (!row) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Opd Department"),
        );
      else return null;
    }

    logger.info("exiting::getOpdDepartmentById::service");
    return row;
  },

  async updateOpdDepartment(
    input: CreateOrUpdateOpdDepartment,
  ): Promise<OpdDepartmentDTO> {
    logger.info("entering::updateOpdDepartment::service");
    await updateIdOpdDepartmentServiceValidation(input);
    validIdCheck(input.id as number);

    const isCacheable = await checkIsCacheable(SHORT_CODE.OPD_DEPARTMENT);

    const updated = await updateOpdDepartmentInDb(input);

    if (isCacheable) {
      await updateCache(cacheKey, updated.id, updated);
    }

    logger.info("exiting::updateOpdDepartment::service");

    return toOpdDepartmentDTO(updated);
  },
};
