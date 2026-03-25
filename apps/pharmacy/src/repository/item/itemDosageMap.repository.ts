import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { CreateItemDosageMap } from "@/types/item/itemDosageMap.js";
import { logger } from "@repo/platform/logging/logger.js";
import { ItemMedicineDosageMap } from "@repo/db/generated/prisma/client";

export const createItemDosageMapInDb = async (
  itemDosage: CreateItemDosageMap,
): Promise<void> => {
  logger.info("entering::createItemDosageInDb::repository");
  const store = requestStorage.getStore();
  await db.itemMedicineDosageMap.create({
    data: { ...itemDosage, createdBy: store?.user?.id },
  });
};

export const updateItemDosageMapInDb = async (
  itemDosage: CreateItemDosageMap,
): Promise<void> => {
  logger.info("entering::createItemDosageInDb::repository");
  const store = requestStorage.getStore();
  await db.itemMedicineDosageMap.update({
    where: {
      id: itemDosage.id,
    },
    data: {
      dosageId: itemDosage.dosageId,
      itemId: itemDosage.itemId,
      updatedBy: store?.user?.id,
      qty: itemDosage.qty,
    },
  });
};

export const deleteItemDosageMapInDB = async (id: number) => {
  logger.info("entering::deleteItemDosageMapInDB::repository");
  return db.itemMedicineDosageMap.delete({
    where: {
      id,
    },
  });
};

export const getItemDosageMapByIdFromDb = async (
  id: number,
): Promise<ItemMedicineDosageMap | null> => {
  logger.info("entering::getItemByIdFromDb::repository");
  return db.itemMedicineDosageMap.findUnique({
    where: { id },
  });
};

export const getItemDosageMapByItemAndDosageIdFromDb = async (
  itemId: number,
  dosageId: number,
): Promise<ItemMedicineDosageMap | null> => {
  logger.info("entering::getItemByIdFromDb::repository");
  return db.itemMedicineDosageMap.findFirst({
    where: {
      itemId,
      dosageId,
    },
  });
};
