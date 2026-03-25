import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { CreateOrUpdateStorage } from "@/types/master/storage.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import { InvStorage } from "@repo/db/generated/prisma/client";

export const getStorageByIdFromDb = async (
  id: number,
): Promise<InvStorage | null> => {
  logger.info("entering::getStorageByIdFromDb::repository");
  return db.invStorage.findUnique({ where: { id, isActive: true } });
};

export const getStorageByStorageNameFromDb = async (
  name: string,
): Promise<InvStorage | null> => {
  logger.info("entering::getStorageByStorageNameFromDb::repository");
  return db.invStorage.findFirst({ where: { name, isActive: true } });
};

export const getAllStorageFromDb = async (): Promise<InvStorage[]> => {
  logger.info("entering::getAllStorageFromDb::repository");
  return db.invStorage.findMany({ where: { isActive: true } });
};

export const createStorageInDb = async (storage: CreateOrUpdateStorage) => {
  logger.info("entering::createStorageInDb::repository");
  const store = requestStorage.getStore();
  const storageOmit = customOmit<CreateOrUpdateStorage, "id">(storage, ["id"]);
  return db.invStorage.create({
    data: {
      ...storageOmit.rest,
      createdBy: store?.user?.id,
    },
  });
};

export const updateStorageInDb = async (storage: CreateOrUpdateStorage) => {
  logger.info("entering::updateStorageInDb::repository");
  const store = requestStorage.getStore();
  const storageOmit = customOmit<CreateOrUpdateStorage, "id">(storage, ["id"]);
  return db.invStorage.update({
    where: { id: storage.id, isActive: true },
    data: { ...storageOmit.rest, updatedBy: store?.user?.id },
  });
};
