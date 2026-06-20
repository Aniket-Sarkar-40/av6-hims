import { auditProxy } from "@/config/audit.config.js";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import {
  createLedgerInDb,
  deleteLedgerFromDb,
  updateLedgerInDb,
} from "@/repository/master/ledger.repository.js";
import { CreateOrUpdateLedgerInput } from "@/types/master/ledger.js";

import {
  createOrUpdateLedgerServiceValidation,
  validateDeleteLedgerServiceValidation,
} from "@/validations/service/master/ledger.service.validation.js";
import {
  addToCache,
  deleteCache,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";

const cacheKey = getRedisKey("LEDGER", "all");

const ledgerServiceRaw = {
  async createLedger(input: CreateOrUpdateLedgerInput) {
    logger.info("entering::createLedger::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.LEDGER);
    await createOrUpdateLedgerServiceValidation(input);
    const createdLedger = await createLedgerInDb(input);
    if (isCacheable && createdLedger) {
      await addToCache(cacheKey, createdLedger.id, createdLedger);
    }
    logger.info("exiting::createLedger::service");
    return createdLedger;
  },
  async updateLedger(input: CreateOrUpdateLedgerInput) {
    logger.info("entering::updateLedger::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.LEDGER);
    await createOrUpdateLedgerServiceValidation(input);
    const updatedLedger = await updateLedgerInDb(input);
    if (isCacheable && updatedLedger) {
      await updateCache(cacheKey, updatedLedger.id, updatedLedger);
    }
    logger.info("exiting::updateLedger::service");
    return updatedLedger;
  },
  async deleteLedger(id: number) {
    logger.info("entering::deleteLedger::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.LEDGER);
    await validateDeleteLedgerServiceValidation(id);
    const deletedLedger = await deleteLedgerFromDb(id);
    if (isCacheable && deletedLedger) {
      await deleteCache(cacheKey, deletedLedger.id);
    }
    logger.info("exiting::deleteLedger::service");
  },
};

export const ledgerService = auditProxy.createAuditedService(
  "ledger",
  ledgerServiceRaw
);
