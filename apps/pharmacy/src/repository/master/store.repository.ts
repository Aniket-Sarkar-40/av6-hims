import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { StoreCreateInput, StoreUpdateInput } from "@/types/master/store.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Store } from "@repo/db/generated/prisma/client";

export const createStoreInDb = async (
  store: StoreCreateInput,
): Promise<Store> => {
  logger.info("entering::createStoreInDb::repository");
  const createdBy = requestStorage.getStore()?.user?.id;

  return db.store.create({
    data: {
      name: store.name,
      stockCode: store.stockCode,
      description: store.description,
      branchId: store.branchId ?? undefined,
      wareHouseId: store.wareHouseId ?? undefined,
      createdBy,
    },
  });
};

export const updateStoreInDb = async (
  store: StoreUpdateInput,
): Promise<Store> => {
  logger.info("entering::updateStoreInDb::repository");

  const { id, branchId, wareHouseId, ...rest } = store;
  const updatedBy = requestStorage.getStore()?.user?.id;

  return db.store.update({
    where: { id, isActive: true },
    data: {
      ...rest,
      branchId: wareHouseId ? null : branchId,
      wareHouseId: branchId ? null : wareHouseId,
      updatedBy,
    },
  });
};
export const getStoreByNameFromDb = async (
  name: string,
): Promise<Store | null> => {
  logger.info("entering::getStoreByNameFromDb::repository");
  return db.store.findFirst({
    where: { name, isActive: true },
  });
};

export const getStoreByIdFromDb = async (id: number): Promise<Store | null> => {
  logger.info("entering::getStoreByIdFromDb::repository");
  return db.store.findFirst({
    where: { id, isActive: true },
  });
};

export const getAllStoreFromDb = async (): Promise<Store[]> => {
  logger.info("entering::getAllStoreFromDb::repository");
  return db.store.findMany({
    where: { isActive: true },
  });
};
