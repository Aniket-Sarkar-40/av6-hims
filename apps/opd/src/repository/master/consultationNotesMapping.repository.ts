import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { CreateOrUpdateConsultationNotesMapping } from "@/types/master/consultationNotesMapping.js";
import { logger } from "@repo/platform/logging/logger.js";
import { ConsultationNotesMapping } from "@repo/db/generated/prisma/client";

export const createConsultationNotesMappingInDb = async (
  input: CreateOrUpdateConsultationNotesMapping,
) => {
  logger.info("entering::createConsultationNotesMappingInDb::repository");
  const store = requestStorage.getStore();
  const { consultationNotesId, doctorId } = input;

  return db.$transaction(async (tx) => {
    return await Promise.all(
      consultationNotesId.map((consultationNotesId) =>
        tx.consultationNotesMapping.create({
          data: {
            consultationNotesId,
            doctorId,
            createdBy: store?.user?.id,
          },
        }),
      ),
    );
  });
};

export const updateConsultationNotesMappingInDb = async (
  input: CreateOrUpdateConsultationNotesMapping,
): Promise<ConsultationNotesMapping[]> => {
  logger.info("entering::updateConsultationNotesMappingInDb::repository");
  const store = requestStorage.getStore();
  return db.$transaction(async (tx) => {
    await tx.consultationNotesMapping.updateMany({
      where: { doctorId: input.doctorId, isActive: true },
      data: { isActive: false, deletedBy: store?.user?.id },
    });

    const mappings = await Promise.all(
      input.consultationNotesId.map((consultationNotesId) =>
        tx.consultationNotesMapping.create({
          data: {
            consultationNotesId,
            doctorId: input.doctorId,
            createdBy: store?.user?.id,
          },
        }),
      ),
    );
    return mappings;
  });
};

export const getConsultationNotesMappingByIdFromDb = async (id: number) => {
  logger.info("entering::getConsultationNotesMappingByIdFromDb::repository");
  return db.consultationNotesMapping.findFirst({
    where: { id, isActive: true },
  });
};
export const getConsultationNotesMappingByDoctorIdFromDb = async (
  doctorId: number,
): Promise<ConsultationNotesMapping[]> => {
  logger.info(
    "entering::getConsultationNotesMappingByDoctorIdFromDb::repository",
  );
  return db.consultationNotesMapping.findMany({
    where: { doctorId, isActive: true },
  });
};
export const getConsultationNotesMappingBynotesIdAndDoctorIdFromDb = async (
  consultationNotesId: number,
  doctorId: number,
) => {
  logger.info(
    "entering::getConsultationNotesMappingByIdAndDoctorIdFromDb::repository",
  );
  return db.consultationNotesMapping.findFirst({
    where: { consultationNotesId, doctorId, isActive: true },
  });
};

export const getAllConsultationNotesMappingFromDb = async (): Promise<
  ConsultationNotesMapping[]
> => {
  logger.info("entering::getAllConsultationNotesMappingFromDb::repository");
  return db.consultationNotesMapping.findMany({
    where: { isActive: true },
  });
};
