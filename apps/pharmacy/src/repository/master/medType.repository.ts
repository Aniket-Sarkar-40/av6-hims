import { logger } from "@repo/platform/logging/logger.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { MedType } from "@repo/db/generated/prisma/client";
import { DropDownName } from "@/types/master/dropDownName.js";

export const createMedTypeInDb = async (
  medType: DropDownName,
): Promise<MedType> => {
  logger.info("entering::createMedTypeInDb::repository");
  const store = requestStorage.getStore();
  return db.medType.create({
    data: { ...medType, createdBy: store?.user?.id },
  });
};

export const updateMedTypeInDb = async (
  medType: DropDownName,
): Promise<MedType> => {
  logger.info("entering::updateMedTypeInDb::repository");
  const store = requestStorage.getStore();
  return db.medType.update({
    where: { id: medType.id },
    data: { ...medType, updatedBy: store?.user?.id },
  });
};

export const getMedTypeByMedTypeNameFromDb = async (
  name: string,
): Promise<MedType | null> => {
  logger.info("entering::getMedTypeByMedTypeNameFromDb::repository");
  return db.medType.findFirst({
    where: { name, isActive: true },
  });
};

export const getMedTypeByIdFromDb = async (
  id: number,
): Promise<MedType | null> => {
  logger.info("entering::getMedTypeByIdFromDb::repository");
  return db.medType.findUnique({
    where: { id, isActive: true },
  });
};

export const getAllMedTypeFromDb = async (): Promise<MedType[]> => {
  logger.info("entering::getAllMedTypeFromDb::repository");
  return db.medType.findMany({
    where: { isActive: true },
  });
};
