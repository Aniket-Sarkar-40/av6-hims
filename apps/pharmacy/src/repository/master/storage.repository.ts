import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { DropDownName } from "@/types/master/dropDownName.js";
import { logger } from "@repo/platform/logging/logger.js";
import { PmsStorage } from "@repo/db/generated/prisma/client";

export const createStorageInDb = async (
  storage: DropDownName,
): Promise<PmsStorage> => {
  logger.info("entering::createStorageInDb::repository");
  const store = requestStorage.getStore();
  return db.pmsStorage.create({
    data: { ...storage, createdBy: store?.user?.id },
  });
};

export const updateStorageInDb = async (
  storage: DropDownName,
): Promise<PmsStorage> => {
  logger.info("entering::updateStorageInDb::repository");
  const store = requestStorage.getStore();
  return db.pmsStorage.update({
    where: { id: storage.id },
    data: { ...storage, updatedBy: store?.user?.id },
  });
};

export const getStorageByStorageNameFromDb = async (
  storageName: string,
): Promise<PmsStorage | null> => {
  logger.info("entering::getStorageByStorageNameFromDb::repository");
  return db.pmsStorage.findFirst({
    where: { name: storageName, isActive: true },
  });
};

export const getStorageByIdFromDb = async (
  id: number,
): Promise<PmsStorage | null> => {
  logger.info("entering::getStorageByIdFromDb::repository");
  return db.pmsStorage.findUnique({ where: { id, isActive: true } });
};

export const getAllStorageFromDb = async (): Promise<PmsStorage[]> => {
  logger.info("entering::getAllStorageFromDb::repository");
  return db.pmsStorage.findMany({ where: { isActive: true } });
};
