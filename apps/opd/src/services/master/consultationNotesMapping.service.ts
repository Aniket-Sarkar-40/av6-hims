import {
  createConsultationNotesMappingInDb,
  getConsultationNotesMappingByIdFromDb,
  updateConsultationNotesMappingInDb,
} from "@/repository/master/consultationNotesMapping.repository.js";
import { CreateOrUpdateConsultationNotesMapping } from "@/types/master/consultationNotesMapping.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  addToCache,
  deleteCache,
  getAllCache,
  getCacheById,
} from "@repo/platform/cache/redis.utils.js";
import { getRedisKey } from "@/config/cache.config.js";
import { checkIsCacheable } from "@/config/cache.config.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/opd.shortCode.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  createConsultationNotesMappingServiceValidation,
  updateConsultationNotesMappingServiceValidation,
} from "@/validations/service/master/consultationNotesMappings.service.validation.js";
import { ConsultationNotesMapping } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("CONSULTATION_NOTES_MAPPING", "all");

export const consultationNotesMappingService = {
  async createConsultationNotesMapping(
    input: CreateOrUpdateConsultationNotesMapping,
  ) {
    logger.info("entering::createConsultationNotesMapping::service");

    await createConsultationNotesMappingServiceValidation(input);

    const isCacheable = await checkIsCacheable(
      SHORT_CODE.CONSULTATION_NOTES_MAPPINGS,
    );

    const created = await createConsultationNotesMappingInDb(input);

    if (isCacheable) {
      for (const mapping of created) {
        await addToCache(cacheKey, mapping.id, mapping);
      }
    }
    logger.info("exiting::createConsultationNotesMapping::service");
    return created;
  },

  async updateConsultationNotesMapping(
    input: CreateOrUpdateConsultationNotesMapping,
  ) {
    logger.info("entering::updateConsultationNotesMapping::service");

    await updateConsultationNotesMappingServiceValidation(input);

    const isCacheable = await checkIsCacheable(
      SHORT_CODE.CONSULTATION_NOTES_MAPPINGS,
    );

    const updated = await updateConsultationNotesMappingInDb(input);

    if (isCacheable) {
      const cachedItems = await getAllCache(cacheKey);

      if (cachedItems?.length) {
        for (const item of cachedItems as ConsultationNotesMapping[]) {
          if (item.doctorId === input.doctorId) {
            await deleteCache(cacheKey, item.id);
          }
        }
      }

      for (const mapping of updated) {
        await addToCache(cacheKey, mapping.id, mapping);
      }
    }

    logger.info("exiting::updateConsultationNotesMapping::service");
    return updated;
  },

  async getConsultationNotesMappingById(
    id: number,
    canNullReturnable: boolean = false,
  ) {
    logger.info("entering::getConsultationNotesMappingById::service");
    validIdCheck(id);
    const isCacheable = await checkIsCacheable(
      SHORT_CODE.CONSULTATION_NOTES_MAPPINGS,
    );
    let mapping;
    if (isCacheable) {
      mapping = (await getCacheById(
        cacheKey,
        id,
      )) as ConsultationNotesMapping | null;
    } else {
      mapping = await getConsultationNotesMappingByIdFromDb(id);
    }
    if (!mapping) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Consultation Notes Mapping"),
        );
      else return null;
    }

    logger.info("exiting::getConsultationNotesMappingById::service");
    return mapping;
  },
};
