import { auditProxy } from "@/config/audit.config.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { toggleStatusChequeMasterByIdFromDb } from "@/repository/master/chequeMaster.repository.js";
import { toggleStatusChequeMasterServiceValidation } from "@/validations/service/master/chequeMaster.service.validation.js";
import { updateCache } from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";

const cacheKey = getRedisKey("CHEQUE_MASTER", "all");

const chequeMasterServiceRaw = {
  async toggleStatusChequeMaster(chequeMasterId: number) {
    logger.info("entering::toggleStatusChequeMaster::service");
    const newStatus = await toggleStatusChequeMasterServiceValidation(
      chequeMasterId
    );
    const isCacheable = await checkIsCacheable(SHORT_CODE.CHEQUE_MASTER);
    const updatedChequeMaster = await toggleStatusChequeMasterByIdFromDb(
      chequeMasterId,
      newStatus
    );
    if (isCacheable && updatedChequeMaster) {
      await updateCache(cacheKey, updatedChequeMaster.id, updatedChequeMaster);
    }

    logger.info("exiting::toggleStatusChequeMaster::service");
  },
};

export const chequeMasterService = auditProxy.createAuditedService(
  "chequeMaster",
  chequeMasterServiceRaw
);
