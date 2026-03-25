import {
  createMedCompoInDb,
  getAllMedCompoFromDb,
  getMedCompoByIdFromDb,
  updateMedCompoInDb,
} from "@/repository/master/medComposition.repository.js";
import { DropDownName } from "@/types/master/dropDownName.js";
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
  createMedCompoServiceValidation,
  updateIdMedCompoServiceValidation,
} from "@/validations/service/master/medComposition.service.validation.js";
import { MedicineCompo } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("MEDICINE_COMPO", "all");

export const medCompositionService = {
  async createMedCompo(input: DropDownName) {
    logger.info("entering::medCompositionService::service");
    await createMedCompoServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_COMPO);
    const medComposition = await createMedCompoInDb(input);
    if (isCacheable && medComposition) {
      await addToCache(cacheKey, medComposition.id, medComposition);
    }
    logger.info("exiting::medCompositionService::service");
    return medComposition;
  },

  async getAllMedCompo() {
    logger.info("entering::getAllMedCompo::service");
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_COMPO);
    if (isCacheable) {
      const cachedMedCompo = (await getAllCache(cacheKey)) as
        | MedicineCompo[]
        | null;
      if (cachedMedCompo && cachedMedCompo.length > 0) {
        return cachedMedCompo;
      } else {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Composition"),
        );
      }
    } else {
      const medCompo = await getAllMedCompoFromDb();
      if (medCompo.length === 0) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Composition"),
        );
      }
      logger.info("exiting::getAllMedCompo::service");
      return medCompo;
    }
  },

  async getCMedCompoById(
    medCompoId: number,
    canNullReturnable: boolean = false,
  ) {
    logger.info("entering::getCMedCompoById::service");
    validIdCheck(medCompoId);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_COMPO);
    let medCompo: MedicineCompo | null;
    if (isCacheable) {
      medCompo = (await getCacheById(
        cacheKey,
        medCompoId,
      )) as MedicineCompo | null;
    } else {
      medCompo = await getMedCompoByIdFromDb(medCompoId);
    }
    if (!medCompo) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Medicine Composition"),
        );
      else return null;
    }
    logger.info("exiting::getCMedCompoById::service");
    return medCompo;
  },

  async updateMedCompo(input: DropDownName): Promise<MedicineCompo> {
    logger.info("entering::updateMedCompo::service");
    await updateIdMedCompoServiceValidation(input);
    const isCacheable = await checkIsCacheable(SHORT_CODE.MED_COMPO);
    const updatedMedCompo = await updateMedCompoInDb(input);
    if (isCacheable) {
      await updateCache(cacheKey, input.id!, updatedMedCompo);
    }
    logger.info("exiting::updateMedCompo::service");
    return updatedMedCompo;
  },
};
