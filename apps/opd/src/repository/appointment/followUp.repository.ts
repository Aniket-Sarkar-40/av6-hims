import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CreateFollowUpInput,
  ReminderJson,
} from "@/types/appointment/followUp.js";
import { logger } from "@repo/platform/logging/logger.js";
import { PatientFollowUp } from "@repo/db/generated/prisma/client";

export const createFollowUpInDb = async (input: CreateFollowUpInput) => {
  logger.info("entering::createFollowUpInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.patientFollowUp.create({
    data: {
      ...input,
      followUpDate: new Date(
        new Date().setDate(new Date().getDate() + input.followUpDays),
      ),
      isReminderSent: ReminderJson,
      createdBy: currentUser,
    },
  });
};

export const getFollowUpByIdFromDb = async (
  id: number,
): Promise<PatientFollowUp | null> => {
  logger.info("entering::getFollowUpByIdFromDb::repository");
  return await db.patientFollowUp.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
};
export const getFollowUpByAppointmentIdFromDb = async (
  appointmentId: number,
): Promise<PatientFollowUp | null> => {
  logger.info("entering::getFollowUpByAppointmentIdFromDb::repository");
  return await db.patientFollowUp.findFirst({
    where: {
      appointmentId,
      isActive: true,
    },
  });
};
