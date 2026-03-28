import { logger } from "@repo/platform/logging/logger.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { DropDownName } from "@/types/master/dropDownName.js";
import { MedDrug } from "@repo/db/generated/prisma/client";

export const createMedDrugInDb = async (
  medDrug: DropDownName,
): Promise<MedDrug> => {
  logger.info("entering::createMedDrugInDb::repository");
  const store = requestStorage.getStore();
  return db.medDrug.create({
    data: { ...medDrug, createdBy: store?.user?.id },
  });
};

export const updateMedDrugInDb = async (
  medDrug: DropDownName,
): Promise<MedDrug> => {
  logger.info("entering::updateMedDrugInDb::repository");
  const store = requestStorage.getStore();
  return db.medDrug.update({
    where: { id: medDrug.id },
    data: { ...medDrug, updatedBy: store?.user?.id },
  });
};

export const getMedDrugByMedDrugNameFromDb = async (
  name: string,
): Promise<MedDrug | null> => {
  logger.info("entering::getMedDrugByMedDrugNameFromDb::repository");
  return db.medDrug.findFirst({
    where: { name, isActive: true },
  });
};

export const getMedDrugByIdFromDb = async (
  id: number,
): Promise<MedDrug | null> => {
  logger.info("entering::getMedDrugByIdFromDb::repository");
  return db.medDrug.findUnique({
    where: { id, isActive: true },
  });
};

export const getAllMedDrugFromDb = async (): Promise<MedDrug[]> => {
  logger.info("entering::getAllMedDrugFromDb::repository");
  return db.medDrug.findMany({
    where: { isActive: true },
  });
};

export const getMedDrugByNameFromDb = async (
  name: string,
): Promise<MedDrug | null> => {
  logger.info("entering::getMedDrugByNameFromDb::repository");
  return db.medDrug.findFirst({
    where: { name, isActive: true },
  });
};
