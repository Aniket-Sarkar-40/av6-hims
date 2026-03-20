import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { CreateConsultationInput } from "@/types/appointment/consultation.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Consultation } from "@repo/db/generated/prisma/client";

export const createConsultationInDb = async (
  input: CreateConsultationInput,
) => {
  logger.info("entering::createConsultationInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const existing = await db.consultation.findFirst({
    where: {
      appointmentId: input.appointmentId,
      isActive: true,
    },
  });

  if (existing) {
    return await db.consultation.update({
      where: {
        id: existing.id,
      },
      data: {
        ...input,
        updatedBy: currentUser,
      },
    });
  }
  return await db.consultation.create({
    data: {
      ...input,
      createdBy: currentUser,
    },
  });
};

export const getConsultationByIdFromDb = async (
  id: number,
): Promise<Consultation | null> => {
  logger.info("entering::getConsultationByIdFromDb::repository");
  return await db.consultation.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
};
