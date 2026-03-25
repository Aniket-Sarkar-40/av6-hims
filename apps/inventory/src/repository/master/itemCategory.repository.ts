import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  ItemCategoryReq,
  ItemCategoryUpdate,
} from "@/types/master/itemCategory.js";

import { logger } from "@repo/platform/logging/logger.js";
import { InvItemCategory } from "@repo/db/generated/prisma/client";

export const createItemCategoryInDb = async (
  itemCategory: ItemCategoryReq,
): Promise<InvItemCategory> => {
  logger.info("entering::createItemCategoryInDb::repository");
  const store = requestStorage.getStore();
  return db.invItemCategory.create({
    data: {
      ...itemCategory,
      createdBy: store?.user?.id,
    },
  });
};

export const updateItemCategoryInDb = async (
  itemCategory: ItemCategoryUpdate,
): Promise<InvItemCategory> => {
  logger.info("entering::updateItemCategoryInDb::repository");
  const store = requestStorage.getStore();
  return db.invItemCategory.update({
    where: { id: itemCategory.id },
    data: { ...itemCategory, updatedBy: store?.user?.id },
  });
};

export const getItemCategoryByItemCategoryNameFromDb = async (
  name: string,
): Promise<InvItemCategory | null> => {
  logger.info("entering::getItemCategoryByItemCategoryNameFromDb::repository");
  return db.invItemCategory.findFirst({
    where: { name, isActive: true },
  });
};

export const getItemCategoryByIdFromDb = async (
  id: number,
): Promise<InvItemCategory | null> => {
  logger.info("entering::getItemCategoryByIdFromDb::repository");
  return db.invItemCategory.findUnique({
    where: { id, isActive: true },
  });
};

export const getAllItemCategoryFromDb = async (): Promise<
  InvItemCategory[]
> => {
  logger.info("entering::getAllItemCategoryFromDb::repository");
  return db.invItemCategory.findMany({
    where: {
      isActive: true,
    },
  });
};

export const getCountMedCategoriesFromDb = async (categoryIds: number[]) => {
  return db.invItemCategory.findMany({
    where: {
      id: { in: categoryIds },
      isActive: true,
    },
    select: { id: true },
  });
};
