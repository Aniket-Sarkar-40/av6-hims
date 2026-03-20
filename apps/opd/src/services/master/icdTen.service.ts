import { getICDTenIdFromDb } from "@/repository/master/icdTen.repository.js";
import { ICDTenDTO } from "@/types/master/icdTen.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { getCacheById } from "@repo/platform/cache/redis.utils.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/opd.shortCode.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { ICDTen } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("ICD_TEN", "all");

export const icdTenService = {
  async getICDTenById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<ICDTenDTO | null> {
    logger.info("entering::getICDTenById::service");

    validIdCheck(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.ICD_TEN);
    let row: ICDTen | null = null;

    if (isCacheable) {
      row = (await getCacheById(cacheKey, id)) as ICDTen | null;
    } else {
      row = await getICDTenIdFromDb(id);
    }

    if (!row) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "ICD Ten"),
        );
      else return null;
    }

    logger.info("exiting::getICDTenById::service");
    return row;
  },
};
