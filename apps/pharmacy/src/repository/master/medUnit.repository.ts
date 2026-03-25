import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { DropDownName } from "@/types/master/dropDownName.js";
import { logger } from "@repo/platform/logging/logger.js";
import { MedicineUnit } from "@repo/db/generated/prisma/client";

export const createMedUnitInDb = async (
  unit: DropDownName,
): Promise<MedicineUnit> => {
  logger.info("entering::createMedUnitInDb::repository");
  const store = requestStorage.getStore();
  return db.medicineUnit.create({
    data: { ...unit, createdBy: store?.user?.id },
  });
};

export const getAllMedUnitFromDb = async () => {
  logger.info("entering::getAllMedUnitFromDb::repository");
  return db.medicineUnit.findMany({
    where: { isActive: true },
  });
};

export const getMedUnitByIdFromDb = async (id: number) => {
  logger.info("entering::getMedUnitByIdFromDb::repository");
  return db.medicineUnit.findUnique({
    where: { id, isActive: true },
  });
};

export const getMedUnitByNameFromDb = async (
  name: string,
): Promise<MedicineUnit | null> => {
  logger.info("entering::getMedUnitByNameFromDb::repository");
  return db.medicineUnit.findFirst({
    where: { name, isActive: true },
  });
};

export const updateMedUnitInDb = async (input: DropDownName) => {
  logger.info("entering::updateMedUnitInDb::repository");
  const store = requestStorage.getStore();
  return db.medicineUnit.update({
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

export const getCountMedUnitsFromDb = async (itemUnitIds: number[]) => {
  return db.medicineUnit.findMany({
    where: {
      id: { in: itemUnitIds },
      isActive: true,
    },
    select: { id: true },
  });
};
