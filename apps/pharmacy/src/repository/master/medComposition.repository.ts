import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { DropDownName } from "@/types/master/dropDownName.js";
import { logger } from "@repo/platform/logging/logger.js";
import { MedicineCompo } from "@repo/db/generated/prisma/client";

export const createMedCompoInDb = async (
  input: DropDownName,
): Promise<MedicineCompo> => {
  logger.info("entering::createCity::repository");
  const store = requestStorage.getStore();
  return db.medicineCompo.create({
    data: { ...input, createdBy: store?.user?.id },
  });
};

export const getAllMedCompoFromDb = async () => {
  logger.info("entering::getAllMedCompoFromDb::repository");
  return db.medicineCompo.findMany({
    where: { isActive: true },
  });
};

export const getMedCompoByIdFromDb = async (id: number) => {
  logger.info("entering::getMedCompoByIdFromDb::repository");
  return db.medicineCompo.findUnique({
    where: { id, isActive: true },
  });
};

export const getMedCompoByNameFromDb = async (
  name: string,
): Promise<MedicineCompo | null> => {
  logger.info("entering::getMedCompoByNameFromDb::repository");
  return db.medicineCompo.findFirst({
    where: { name, isActive: true },
  });
};

export const updateMedCompoInDb = async (input: DropDownName) => {
  logger.info("entering::updateCountry::repository");
  const store = requestStorage.getStore();
  return db.medicineCompo.update({
    where: {
      id: input.id,
      isActive: true,
    },
    data: {
      updatedBy: store?.user?.id,
      description: input.description,
      name: input.name,
    },
  });
};
