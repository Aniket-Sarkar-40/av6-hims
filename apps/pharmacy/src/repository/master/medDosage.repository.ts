import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { DropDownName } from "@/types/master/dropDownName.js";
import { logger } from "@repo/platform/logging/logger.js";
import { MedicineDosage } from "@repo/db/generated/prisma/client";

export const createMedDosageInDb = async (
  unit: DropDownName,
): Promise<MedicineDosage> => {
  logger.info("entering::createMedDosageInDb::repository");
  const store = requestStorage.getStore();
  return db.medicineDosage.create({
    data: { ...unit, createdBy: store?.user?.id },
  });
};

export const getAllMedDosageFromDb = async () => {
  logger.info("entering::getAllMedDosageFromDb::repository");
  return db.medicineDosage.findMany({
    where: { isActive: true },
  });
};

export const getMedDosageByIdFromDb = async (id: number) => {
  logger.info("entering::getMedDosageByIdFromDb::repository");
  return db.medicineDosage.findUnique({
    where: { id, isActive: true },
  });
};

export const getMedDosageByNameFromDb = async (
  name: string,
): Promise<MedicineDosage | null> => {
  logger.info("entering::getMedDosageByNameFromDb::repository");
  return db.medicineDosage.findFirst({
    where: { name, isActive: true },
  });
};

export const updateMedDosageInDb = async (input: DropDownName) => {
  logger.info("entering::updateMedDosageInDb::repository");
  const store = requestStorage.getStore();
  return db.medicineDosage.update({
    where: {
      id: input.id,
    },
    data: {
      updatedBy: store?.user?.id,
      description: input.description,
      name: input.name,
    },
  });
};
