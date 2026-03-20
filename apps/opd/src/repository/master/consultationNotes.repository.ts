import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { CreateOrUpdateConsultationNotes } from "@/types/master/consultationNotes.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import { ConsultationNotes } from "@repo/db/generated/prisma/client";

export const createConsultationNotesInDb = async (
  data: CreateOrUpdateConsultationNotes,
): Promise<ConsultationNotes> => {
  logger.info("entering::createConsultationNotesInDb::repository");
  const store = requestStorage.getStore();
  const consultationNotesOmit = customOmit<
    CreateOrUpdateConsultationNotes,
    "id"
  >(data, ["id"]);
  return db.consultationNotes.create({
    data: {
      ...consultationNotesOmit.rest,
      createdBy: store?.user?.id,
    },
  });
};

export const updateConsultationNotesInDb = async (
  data: CreateOrUpdateConsultationNotes,
): Promise<ConsultationNotes> => {
  logger.info("entering::updateConsultationNotesInDb::repository");
  const store = requestStorage.getStore();
  return db.consultationNotes.update({
    where: { id: data.id },
    data: {
      ...data,
      updatedBy: store?.user?.id,
    },
  });
};

export const getConsultationNotesByNameFromDb = async (
  consultationName: string,
): Promise<ConsultationNotes | null> => {
  logger.info("entering::getConsultationNotesByNameFromDb::repository");
  return db.consultationNotes.findFirst({
    where: { consultationName, isActive: true },
  });
};

export const getConsultationNotesByIdFromDb = async (
  id: number,
): Promise<ConsultationNotes | null> => {
  logger.info("entering::getConsultationNotesByIdFromDb::repository");
  return db.consultationNotes.findFirst({
    where: { id, isActive: true },
  });
};
