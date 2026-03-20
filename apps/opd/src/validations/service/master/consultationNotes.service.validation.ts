import {
  getConsultationNotesByIdFromDb,
  getConsultationNotesByNameFromDb,
} from "@/repository/master/consultationNotes.repository.js";
import { CreateOrUpdateConsultationNotes } from "@/types/master/consultationNotes.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";

import { ConsultationNotes } from "@repo/db/generated/prisma/client";

export const validIdConsultationNotes = async (
  id: number,
): Promise<ConsultationNotes> => {
  logger.info("entering::validIdConsultationNotes::service::validation");

  validIdCheck(id);

  const row = await getConsultationNotesByIdFromDb(id);
  if (!row) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Consultation Notes"),
    );
  }
  logger.info("exiting::validIdConsultationNotes::service::validation");

  return row;
};

export const updateIdConsultationNotesServiceValidation = async (
  body: CreateOrUpdateConsultationNotes,
): Promise<ConsultationNotes | null> => {
  logger.info(
    "entering::updateIdConsultationNotesServiceValidation::service::validation",
  );

  if (body.id) validIdCheck(body.id);

  if (body.id) {
    const existing = await getConsultationNotesByIdFromDb(body.id);
    if (!existing) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Consultation Notes"),
      );
    }
  }

  if (body.consultationName) {
    const sameName = await getConsultationNotesByNameFromDb(
      body.consultationName,
    );
    if (sameName) {
      if (sameName.id !== body.id) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("DUPLICATE_ITEM", "Consultation Note title"),
        );
      }
    }
  }
  logger.info(
    "exiting::updateIdConsultationNotesServiceValidation::service::validation",
  );
  return null;
};

export const nameConsultationNotesServiceValidation = async (
  name: string,
): Promise<void> => {
  logger.info(
    "entering::nameConsultationNotesServiceValidation::service::validation",
  );
  const row = await getConsultationNotesByNameFromDb(name);
  if (row) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Consultation Notes"),
    );
  }
  logger.info(
    "exiting::nameConsultationNotesServiceValidation::service::validation",
  );
  return;
};

export const createConsultationNotesServiceValidation = async (
  body: CreateOrUpdateConsultationNotes,
): Promise<ConsultationNotes | null> => {
  logger.info(
    "entering::createConsultationNotesServiceValidation::service::validation",
  );

  const byName = await getConsultationNotesByNameFromDb(body.consultationName);
  if (byName) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Consultation Note title"),
    );
  }

  logger.info(
    "exiting::createConsultationNotesServiceValidation::service::validation",
  );
  return byName;
};
