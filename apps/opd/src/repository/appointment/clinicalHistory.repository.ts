import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CreateClinicalHistoryInput,
  UpdateClinicalHistoryInput,
} from "@/types/appointment/clinicalHistory.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import { ClinicalHistory } from "@repo/db/generated/prisma/client";

export const createClinicalHistoryInDb = async (
  input: CreateClinicalHistoryInput,
) => {
  logger.info("entering::createClinicalHistoryInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const existing = await db.clinicalHistory.findFirst({
    where: {
      appointmentId: input.appointmentId,
      isActive: true,
    },
  });

  if (existing) {
    return await db.clinicalHistory.update({
      where: {
        id: existing.id,
      },
      data: {
        ...input,
        updatedBy: currentUser,
      },
    });
  }
  return await db.clinicalHistory.create({
    data: {
      ...input,
      createdBy: currentUser,
    },
  });
};

export const updateClinicalHistoryInDb = async (
  input: UpdateClinicalHistoryInput,
) => {
  logger.info("entering::updateClinicalHistoryInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const omittedInput = customOmit<UpdateClinicalHistoryInput, "id">(input, [
    "id",
  ]);
  return await db.clinicalHistory.update({
    where: {
      id: input.id,
      isActive: true,
    },
    data: {
      ...omittedInput.rest,
      createdBy: currentUser,
    },
  });
};

export const getClinicalHistoryByIdFromDb = async (
  id: number,
): Promise<ClinicalHistory | null> => {
  logger.info("entering::getClinicalHistoryByIdFromDb::repository");
  return await db.clinicalHistory.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
};
