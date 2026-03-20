import { toOpdDepartmentPrefixDTO } from "@/mapper/master/opdDepartmentPrefix.mapper.js";
import {
  createOpdDepartmentPrefixInDb,
  getOpdDepartmentPrefixByIdFromDb,
  updateOpdDepartmentPrefixInDb,
} from "@/repository/master/opdDepartment.repositoryPrefix.js";
import {
  CreateOrUpdateOpdDepartmentPrefix,
  OpdDepartmentPrefixDTO,
} from "@/types/master/opdDepartmentPrefix.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { getRedisKey } from "@/config/cache.config.js";
import { checkIsCacheable } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/opd.shortCode.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  createOpdDepartmentPrefixServiceValidation,
  getIdOpdDepartmentPrefixServiceValidation,
  updateIdOpdDepartmentPrefixServiceValidation,
} from "@/validations/service/master/opdDepartmentPrefix.service.validation.js";
import { OpdDepartmentPrefix } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("OPD_DEPARTMENT_PREFIX", "all");

export const opdDepartmentPrefixService = {
  async createOpdDepartmentPrefix(
    input: CreateOrUpdateOpdDepartmentPrefix,
  ): Promise<OpdDepartmentPrefixDTO> {
    logger.info("entering::createOpdDepartmentPrefix::service");

    await createOpdDepartmentPrefixServiceValidation(input);

    const isCacheable = await checkIsCacheable(
      SHORT_CODE.OPD_DEPARTMENT_PREFIX,
    );

    const created = await createOpdDepartmentPrefixInDb(input);

    if (isCacheable) {
      await addToCache(cacheKey, created.id, created);
    }

    logger.info("exiting::createOpdDepartmentPrefix::service");
    return toOpdDepartmentPrefixDTO(created);
  },

  async getOpdDepartmentPrefixById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<OpdDepartmentPrefixDTO | null> {
    logger.info("entering::getOpdDepartmentPrefixById::service");
    await getIdOpdDepartmentPrefixServiceValidation(id);

    const isCacheable = await checkIsCacheable(
      SHORT_CODE.OPD_DEPARTMENT_PREFIX,
    );
    let row: OpdDepartmentPrefix | null = null;

    if (isCacheable) {
      row = (await getCacheById(cacheKey, id)) as OpdDepartmentPrefix | null;
    } else {
      row = await getOpdDepartmentPrefixByIdFromDb(id);
    }

    if (!row) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Opd Department"),
        );
      else return null;
    }

    logger.info("exiting::getOpdDepartmentPrefixById::service");
    return toOpdDepartmentPrefixDTO(row);
  },

  async updateOpdDepartmentPrefix(
    input: CreateOrUpdateOpdDepartmentPrefix,
  ): Promise<OpdDepartmentPrefixDTO> {
    logger.info("entering::updateOpdDepartmentPrefix::service");
    await updateIdOpdDepartmentPrefixServiceValidation(input);
    validIdCheck(input.id as number);

    const isCacheable = await checkIsCacheable(
      SHORT_CODE.OPD_DEPARTMENT_PREFIX,
    );

    const updated = await updateOpdDepartmentPrefixInDb(input);

    if (isCacheable) {
      await updateCache(cacheKey, updated.id, updated);
    }

    logger.info("exiting::updateOpdDepartmentPrefix::service");

    return toOpdDepartmentPrefixDTO(updated);
  },
};
