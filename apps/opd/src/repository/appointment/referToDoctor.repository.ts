import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CreateReferToDoctorInput,
  UpdateReferToDoctorInput,
} from "@/types/appointment/referToDoctor.js";
import { logger } from "@repo/platform/logging/logger.js";

export const createReferToDoctorInDb = async (
  input: CreateReferToDoctorInput,
) => {
  logger.info("entering::createReferToDoctorInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.patientReferToDoctor.create({
    data: {
      ...input,
      createdBy: currentUser,
    },
  });
};
export const updateReferToDoctorInDb = async (
  input: UpdateReferToDoctorInput,
) => {
  logger.info("entering::updateReferToDoctorInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.patientReferToDoctor.update({
    where: {
      id: input.id,
    },
    data: {
      ...input,
      updatedBy: currentUser,
    },
  });
};
export const getReferToDoctorByIdFromDb = async (id: number) => {
  logger.info("entering::getReferToDoctorByIdFromDb::repository");

  return await db.patientReferToDoctor.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
};
