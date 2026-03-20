import { PatientAdviceDetails } from "@repo/db/generated/prisma/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { CreatePatientAdviceDetailsInput } from "@/types/appointment/patientAdviceDetails.js";
import { logger } from "@repo/platform/logging/logger.js";

export const createPatientAdviceDetailsInDb = async (
  input: CreatePatientAdviceDetailsInput,
) => {
  logger.info("entering::createPatientAdviceDetailsInDb::repository");
  const store = requestStorage.getStore();
  const currentUserId = store?.user?.id;
  return await db.$transaction(async (tx) => {
    const existing = await tx.patientAdviceDetails.findFirst({
      where: {
        patientId: input.patientId,
        appointmentId: input.appointmentId,
        isActive: true,
      },
    });

    if (existing) {
      return await tx.patientAdviceDetails.update({
        where: {
          id: existing.id,
        },
        data: {
          ...input,
          updatedBy: currentUserId,
        },
      });
    } else {
      return await tx.patientAdviceDetails.create({
        data: {
          ...input,
          createdBy: currentUserId,
        },
      });
    }
  });
};

export const getPatientAdviceDetailsByAppointmentIdFromDb = async (
  appointmentId: number,
): Promise<PatientAdviceDetails | null> => {
  logger.info("entering::getConsultationComplaintFromDb::repository");

  return db.patientAdviceDetails.findFirst({
    where: {
      appointmentId,
      isActive: true,
    },
  });
};
