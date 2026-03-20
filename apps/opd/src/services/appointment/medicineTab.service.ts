import {
  createMedicineTabInDb,
  deleteMedicineTabFromDb,
  getMedicineTabByIdFromDb,
  updateMedicineTabInDb,
} from "@/repository/appointment/medicineTab.repository.js";
import { CreateOrUpdateMedicineTab } from "@/types/appointment/medicineTab.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  deleteCache,
  getCacheById,
  updateCache,
} from "@repo/platform/cache/redis.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/opd.shortCode.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  createMedicineTabServiceValidation,
  updateIdMedicineTabServiceValidation,
  validIdMedicineTab,
} from "@/validations/service/appointment/medicineTab.service.validation.js";
import { MedicineTab } from "@repo/db/generated/prisma/client";
import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";

const cacheKey = getRedisKey("MEDICINE_TAB", "all");

export const medicineTabService = {
  async createMedicineTab(
    input: CreateOrUpdateMedicineTab,
  ): Promise<MedicineTab> {
    logger.info("entering::createMedicineTab::service");

    await createMedicineTabServiceValidation(input);

    const isCacheable = await checkIsCacheable(SHORT_CODE.MEDICINE_TAB);
    const created = await createMedicineTabInDb(input);

    if (isCacheable) {
      await addToCache(cacheKey, created.id, created);
    }

    logger.info("exiting::createMedicineTab::service");
    return created;
  },

  async getMedicineTabById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<MedicineTab | null> {
    logger.info("entering::getMedicineTabById::service");
    validIdCheck(id);

    const isCacheable = await checkIsCacheable(SHORT_CODE.MEDICINE_TAB);
    let row: MedicineTab | null = null;

    if (isCacheable) {
      row = (await getCacheById(cacheKey, id)) as MedicineTab | null;
    } else {
      row = await getMedicineTabByIdFromDb(id);
    }

    if (!row) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Tab"),
        );
      else return null;
    }

    logger.info("exiting::getMedicineTabById::service");
    return row;
  },

  async updateMedicineTab(
    input: CreateOrUpdateMedicineTab,
  ): Promise<MedicineTab> {
    logger.info("entering::updateMedicineTab::service");
    await updateIdMedicineTabServiceValidation(input);
    validIdCheck(input.id as number);

    const isCacheable = await checkIsCacheable(SHORT_CODE.MEDICINE_TAB);
    const updated = await updateMedicineTabInDb(input);

    if (isCacheable) {
      await updateCache(cacheKey, updated.id, updated);
    }

    logger.info("exiting::updateMedicineTab::service");
    return updated;
  },

  async deleteMedicineTab(id: number): Promise<void> {
    logger.info("entering::deleteMedicineTab::service");

    await validIdMedicineTab(id);

    const isCacheable = await checkIsCacheable(SHORT_CODE.MEDICINE_TAB);
    await deleteMedicineTabFromDb(id);
    if (isCacheable) {
      await deleteCache(cacheKey, id);
    }

    logger.info("exiting::deleteMedicineTab::service");
  },
};
