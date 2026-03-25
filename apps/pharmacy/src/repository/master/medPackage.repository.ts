import { logger } from "@repo/platform/logging/logger.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { MedPackage } from "@repo/db/generated/prisma/client";
import { DropDownName } from "@/types/master/dropDownName.js";

export const createMedPackageInDb = async (
  medPackage: DropDownName,
): Promise<MedPackage> => {
  logger.info("entering::createMedPackageInDb::repository");
  const store = requestStorage.getStore();
  return db.medPackage.create({
    data: { ...medPackage, createdBy: store?.user?.id },
  });
};

export const updateMedPackageInDb = async (
  medPackage: DropDownName,
): Promise<MedPackage> => {
  logger.info("entering::updateMedPackageInDb::repository");
  const store = requestStorage.getStore();
  return db.medPackage.update({
    where: { id: medPackage.id },
    data: { ...medPackage, updatedBy: store?.user?.id },
  });
};

export const getMedPackageByMedPackageNameFromDb = async (
  name: string,
): Promise<MedPackage | null> => {
  logger.info("entering::getMedPackageByMedPackageNameFromDb::repository");
  return db.medPackage.findFirst({
    where: { name, isActive: true },
  });
};

export const getMedPackageByIdFromDb = async (
  id: number,
): Promise<MedPackage | null> => {
  logger.info("entering::getMedPackageByIdFromDb::repository");
  return db.medPackage.findUnique({
    where: { id, isActive: true },
  });
};

export const getAllMedPackageFromDb = async (): Promise<MedPackage[]> => {
  logger.info("entering::getAllMedPackageFromDb::repository");
  return db.medPackage.findMany({
    where: { isActive: true },
  });
};

export const getMedPackageByNameFromDb = async (
  name: string,
): Promise<MedPackage | null> => {
  logger.info("entering::getMedPackageByNameFromDb::repository");
  return db.medPackage.findFirst({
    where: { name, isActive: true },
  });
};

export const getCountPackingSizesFromDb = async (packingSizeIds: number[]) => {
  return db.medPackage.findMany({
    where: {
      id: { in: packingSizeIds },
      isActive: true,
    },
    select: { id: true },
  });
};
