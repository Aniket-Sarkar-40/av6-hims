import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { CreateItemInstructionMap } from "@/types/item/itemDosageMap.js";
import { logger } from "@repo/platform/logging/logger.js";
import { ItemInstructionMap } from "@repo/db/generated/prisma/client";

export const createItemInstructionMapInDb = async (
  itemInstruction: CreateItemInstructionMap,
): Promise<void> => {
  logger.info("entering::createItemInstructionInDb::repository");
  const store = requestStorage.getStore();
  await db.itemInstructionMap.create({
    data: {
      ...itemInstruction,
      createdBy: store?.user?.id,
    },
  });
};

export const updateItemInstructionMapInDb = async (
  itemInstruction: CreateItemInstructionMap,
): Promise<void> => {
  logger.info("entering::updateItemInstructionMapInDb::repository");
  const store = requestStorage.getStore();
  await db.itemInstructionMap.update({
    where: {
      id: itemInstruction.id,
    },
    data: {
      ...itemInstruction,
      updatedBy: store?.user?.id,
    },
  });
};

export const deleteItemInstructionMapInDB = async (id: number) => {
  logger.info("entering::deleteItemInstructionMapInDB::repository");
  return db.itemInstructionMap.delete({
    where: {
      id,
    },
  });
};

export const getItemInstructionMapByIdFromDb = async (
  id: number,
): Promise<ItemInstructionMap | null> => {
  logger.info("entering::getItemInstructionMapByIdFromDb::repository");
  return db.itemInstructionMap.findUnique({
    where: { id },
  });
};

export const getItemInstructionMapByItemAndInstructionIdFromDb = async (
  itemId: number,
  instructionId: number,
): Promise<ItemInstructionMap | null> => {
  logger.info(
    "entering::getItemInstructionMapByItemAndInstructionIdFromDb::repository",
  );
  return db.itemInstructionMap.findFirst({
    where: {
      itemId,
      instructionId,
    },
  });
};
