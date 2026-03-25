import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { uinServiceFactory } from "@/config/core.config.js";
import {
  GetItemStockRequest,
  ItemMasterReq,
  ItemMasterUpdateReq,
} from "@/types/master/itemMaster.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";

import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  InvItem,
  InvItemStock,
  InvUinShortCode,
} from "@repo/db/generated/prisma/client";
import { getItemStocksByLocation } from "@/repository/stock/stock.repository.js";

export const createItemMasterInDb = async (
  itemMaster: ItemMasterReq,
): Promise<InvItem> => {
  logger.info("entering::createItemMasterInDb::repository");
  const store = requestStorage.getStore();

  const item = await db.invItem.create({
    data: {
      ...itemMaster,
      itemCode:
        itemMaster.itemCode ??
        (await uinServiceFactory.generateUIN(InvUinShortCode.ITEM)),
      createdBy: store?.user?.id,
    },
  });

  return item;
};

export const updateItemMasterInDb = async (
  itemMaster: ItemMasterUpdateReq,
): Promise<InvItem> => {
  logger.info("entering::updateItemMasterInDb::repository");
  const store = requestStorage.getStore();
  return db.invItem.update({
    where: { id: itemMaster.id },
    data: {
      ...itemMaster,
      itemCode:
        itemMaster.itemCode ??
        (await uinServiceFactory.generateUIN(InvUinShortCode.ITEM)),
      updatedBy: store?.user?.id,
      frontImage: itemMaster.frontImage ?? null,
      backImage: itemMaster.backImage ?? null,
      leftSideImage: itemMaster.leftSideImage ?? null,
      rightSideImage: itemMaster.rightSideImage ?? null,
    },
  });
};

export const getItemMasterByItemMasterNameFromDb = async (
  item: string,
): Promise<InvItem | null> => {
  logger.info("entering::getItemMasterByItemMasterNameFromDb::repository");
  return db.invItem.findFirst({
    where: { item, isActive: true },
  });
};

export const getItemMasterByItemMasterCodeFromDb = async (
  itemCode: string,
): Promise<InvItem | null> => {
  logger.info("entering::getItemMasterByItemMasterNameFromDb::repository");
  return db.invItem.findFirst({
    where: { itemCode, isActive: true },
  });
};

export const getItemMasterByIdFromDb = async (
  id: number,
): Promise<InvItem | null> => {
  logger.info("entering::getItemMasterByIdFromDb::repository");
  return db.invItem.findUnique({
    where: { id, isActive: true },
  });
};

export const getAllItemMasterFromDb = async (): Promise<InvItem[]> => {
  logger.info("entering::getAllItemMasterFromDb::repository");
  return db.invItem.findMany({
    where: {
      isActive: true,
    },
  });
};

export const getCountItemsFromDb = async (itemIds: number[]) => {
  return db.invItem.findMany({
    where: {
      id: { in: itemIds },
      isActive: true,
    },
  });
};

export const toggleItemActiveInDb = async (id: number): Promise<InvItem> => {
  logger.info("entering::toggleItemActiveInDb::repository");
  const existing = await db.invItem.findUnique({ where: { id } });
  if (!existing) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "item"));
  }
  const updatedItem = await db.invItem.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });
  logger.info("exiting::toggleItemActiveInDb::repository");
  return updatedItem;
};

export const getItemStocksByItemId = async (
  itemReq: GetItemStockRequest,
): Promise<InvItemStock[]> => {
  logger.info("entering::getItemStocksByItemId::repository");

  return await db.$transaction(async (tx) => {
    const { id, ccId, userId, isZeroQty } = itemReq;

    // const quantityCondition = isZeroQty ? {} : { quantity: { gt: 0 } };

    const stocks = await getItemStocksByLocation(
      tx,
      id,
      ccId,
      userId,
      isZeroQty,
    );

    return stocks;
  });
};
