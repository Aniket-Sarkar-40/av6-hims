import { toConsultationNotesDTO } from "@/mapper/master/consultationNotes.mapper.js";
import {
  createConsultationNotesInDb,
  getConsultationNotesByIdFromDb,
  updateConsultationNotesInDb,
} from "@/repository/master/consultationNotes.repository.js";
import {
  ConsultationNotesDTO,
  CreateOrUpdateConsultationNotes,
} from "@/types/master/consultationNotes.js";
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
  createConsultationNotesServiceValidation,
  updateIdConsultationNotesServiceValidation,
} from "@/validations/service/master/consultationNotes.service.validation.js";

import { ConsultationNotes } from "@repo/db/generated/prisma/client";

const cacheKey = getRedisKey("CONSULTATION_NOTES", "all");

export const consultationNotesService = {
  async createConsultationNotes(
    input: CreateOrUpdateConsultationNotes,
  ): Promise<ConsultationNotesDTO> {
    logger.info("entering::createConsultationNotes::service");

    await createConsultationNotesServiceValidation(input);

    const isCacheable = await checkIsCacheable(SHORT_CODE.CONSULTATION_NOTES);

    const created = await createConsultationNotesInDb(input);

    if (isCacheable) {
      await addToCache(cacheKey, created.id, created);
    }

    logger.info("exiting::createConsultationNotes::service");
    return toConsultationNotesDTO(created);
  },

  async getConsultationNotesById(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<ConsultationNotesDTO | null> {
    logger.info("entering::getConsultationNotesById::service");
    validIdCheck(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.CONSULTATION_NOTES);
    let row: ConsultationNotes | null = null;

    if (isCacheable) {
      row = (await getCacheById(cacheKey, id)) as ConsultationNotes | null;
    } else {
      row = await getConsultationNotesByIdFromDb(id);
    }

    if (!row) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Consultation Notes"),
        );
      else return null;
    }

    logger.info("exiting::getConsultationNotesById::service");
    return toConsultationNotesDTO(row);
  },

  async getConsultationNotesByIdWithOutDto(
    id: number,
    canNullReturnable: boolean = false,
  ): Promise<ConsultationNotes | null> {
    logger.info("entering::getConsultationNotesById::service");
    validIdCheck(id);
    const isCacheable = await checkIsCacheable(SHORT_CODE.CONSULTATION_NOTES);
    let row: ConsultationNotes | null = null;

    if (isCacheable) {
      row = (await getCacheById(cacheKey, id)) as ConsultationNotes | null;
    } else {
      row = await getConsultationNotesByIdFromDb(id);
    }

    if (!row) {
      if (!canNullReturnable)
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Consultation Notes"),
        );
      else return null;
    }

    logger.info("exiting::getConsultationNotesById::service");
    return row;
  },

  async updateConsultationNotes(
    input: CreateOrUpdateConsultationNotes,
  ): Promise<ConsultationNotesDTO> {
    logger.info("entering::updateConsultationNotes::service");
    await updateIdConsultationNotesServiceValidation(input);

    const isCacheable = await checkIsCacheable(SHORT_CODE.CONSULTATION_NOTES);

    const updated = await updateConsultationNotesInDb(input);

    if (isCacheable) {
      await updateCache(cacheKey, updated.id, updated);
    }

    logger.info("exiting::updateConsultationNotes::service");

    return toConsultationNotesDTO(updated);
  },
};
