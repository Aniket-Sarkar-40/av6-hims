import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { ItemStoreReq, ItemStoreUpdate } from "@/types/master/itemStore.js";
import { logger } from "@repo/platform/logging/logger.js";
import { InvItemStore } from "@repo/db/generated/prisma/client";

export const createItemStoreInDb = async (
  itemStore: ItemStoreReq,
): Promise<InvItemStore> => {
  logger.info("entering::createItemStoreInDb::repository");
  const store = requestStorage.getStore();
  return db.invItemStore.create({
    data: {
      ...itemStore,
      createdBy: store?.user?.id,
    },
  });
};

export const updateItemStoreInDb = async (
  itemStore: ItemStoreUpdate,
): Promise<InvItemStore> => {
  logger.info("entering::updateItemStoreInDb::repository");
  const store = requestStorage.getStore();
  return db.invItemStore.update({
    where: { id: itemStore.id },
    data: { ...itemStore, updatedBy: store?.user?.id },
  });
};

export const getItemStoreByItemStoreNameFromDb = async (
  itemStoreName: string,
): Promise<InvItemStore | null> => {
  logger.info("entering::getItemStoreByItemStoreNameFromDb::repository");
  return db.invItemStore.findFirst({
    where: { itemStoreName, isActive: true },
  });
};

export const getItemStoreByIdFromDb = async (
  id: number,
): Promise<InvItemStore | null> => {
  logger.info("entering::getItemStoreByIdFromDb::repository");
  return db.invItemStore.findUnique({
    where: { id, isActive: true },
  });
};

export const getAllItemStoreFromDb = async (): Promise<InvItemStore[]> => {
  logger.info("entering::getAllItemStoreFromDb::repository");
  return db.invItemStore.findMany({
    where: {
      isActive: true,
    },
  });
};
