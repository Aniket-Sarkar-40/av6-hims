import { db } from "@repo/db/client";
import { logger } from "@repo/platform/logging/logger.js";
import { Prisma, TimeSlot } from "@repo/db/generated/prisma/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";

export const getTimeSlot = async (
  docId: number,
  date: Date,
): Promise<TimeSlot[]> => {
  logger.info("entering::getTimeSlot::repository");
  return db.timeSlot.findMany({
    where: { docId, bookedDate: new Date(date), isActive: true },
  });
};

export const isTimeSlotAvailableFromDb = async (
  doctorId: number,
  selectedDate: Date | string,
  selectedTime: string,
): Promise<boolean> => {
  const existing = await db.timeSlot.findFirst({
    where: {
      docId: doctorId,
      bookedDate: new Date(selectedDate),
      bookedTime: selectedTime,
      isBooked: true,
      isActive: true,
    },
  });

  return !existing;
};

export const createTimeSlotInDb = async (
  tx: Prisma.TransactionClient,
  input: Prisma.TimeSlotUncheckedCreateInput,
) => {
  logger.info("entering::createTimeSlotInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return tx.timeSlot.create({
    data: {
      ...input,
      createdBy: currentUser,
    },
  });
};

export const deleteTimeSlotFromDb = async (
  tx: Prisma.TransactionClient,
  where: Prisma.TimeSlotWhereInput,
) => {
  logger.info("entering::deleteTimeSlotFromDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return tx.timeSlot.updateMany({
    where,
    data: {
      isActive: false,
      deletedAt: new Date(),
      deletedBy: currentUser,
    },
  });
};
