import { auditProxy } from "@/config/audit.config.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { deleteGroupFromDb } from "@/repository/master/group.repository.js";

import { validateDeleteGroupServiceValidation } from "@/validations/service/master/group.service.validation.js";
import { deleteCache } from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";

const cacheKey = getRedisKey("GROUP", "all");
const groupServiceRaw = {
  async deleteGroup(id: number) {
    logger.info("entering::deleteGroup::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.GROUP);
    await validateDeleteGroupServiceValidation(id);
    await deleteGroupFromDb(id);

    if (isCacheable) {
      await deleteCache(cacheKey, id);
    }
    logger.info("exiting::deleteGroup::service");
  },
};

export const groupService = auditProxy.createAuditedService(
  "group",
  groupServiceRaw
);
