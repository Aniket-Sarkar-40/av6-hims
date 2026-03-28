import {
  CreateItemInput,
  GetItemStockRequest,
  ItemFilter,
  SlowMovingItem,
  UpdateItemInput,
} from "@/types/item/item.js";
import { getItemStocksByLocation } from "../stock/stock.repository.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { applyRound, RoundFormat } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import {
  PmsItem,
  ItemImages,
  PmsItemStock,
  Prisma,
  PmsUinShortCode,
} from "@repo/db/generated/prisma/client";
import { uinServiceFactory } from "@/config/core.config.js";
import { API_TIMEOUT } from "@repo/shared";
import { settingsService } from "@/services/master/settings.service.js";
export async function createItem(
  data: CreateItemInput,
): Promise<PmsItem & { itemImages: ItemImages[] }> {
  const store = requestStorage.getStore();
  const setting = await settingsService.getSettings();
  const precision = setting?.itemPrecision ?? setting?.defaultPrecision ?? 2;
  return db.pmsItem.create({
    data: {
      itemNumber:
        data.itemNumber ??
        (await uinServiceFactory.generateUIN(PmsUinShortCode.ITEM)),
      medicineName: data.medicineName.toString().trim(),
      medCategoryId: data.medCategoryId,
      medTypeId: data.medTypeId,
      medCompId: data.medCompId,
      medUnitId: data.medUnitId,
      packSizeId: data.packSizeId,
      boxSizeId: data.boxSizeId,
      manufacturerId: data.medManufacturerId,
      drugTypeId: data.drugTypeId,
      purchaseAmount: applyRound(
        data.purchaseAmount,
        RoundFormat.TO_FIXED,
        precision,
      ),
      saleAmount: applyRound(data.saleAmount, RoundFormat.TO_FIXED, precision),
      minOrderDetails: data.minOrderDetails,
      rackLocation: data.rackLocation,
      defaultDiscount: data.defaultDiscount,
      defaultB2BDiscount: data.defaultB2BDiscount,
      minStock: data.minStock,
      maxStock: data.maxStock,
      tax: data.tax,
      isAllowLooseSale: data.isAllowLooseSale,
      isLockDiscount: data.isLockDiscount,
      isLockB2BDiscount: data.isLockB2BDiscount,
      isReturnable: data.isReturnable,
      acceptOnlineOrder: data.acceptOnlineOrder,
      isSuggestionLock: data.isSuggestionLock,
      taxMethod: data.taxMethod,
      status: data.status,
      remark: data.remark,
      onHoldSale: data.onHoldSale,
      medPackingType: data.medPackingType,
      barcode: data.barcode,
      cess: data.cess,
      hsnCode: data.hsnCode,
      itemAlias: data.itemAlias,
      tags: data.tags,
      insurancePercentage: data.insurancePercentage,
      walkInPercentage: data.walkInPercentage,
      storageId: data.storageId,
      createdBy: store?.user?.id,

      // nested create for images
      itemImages: {
        create:
          data.images?.map((img) => ({
            name: img.name,
            url: img.url,
            isPrimary: img.isPrimary ?? false,
          })) ?? [],
      },
    },
    include: {
      itemImages: true, // return associated images
    },
  });
}

export const getItemByIdFromDb = async (
  id: number,
): Promise<PmsItem | null> => {
  logger.info("entering::getItemByIdFromDb::repository");
  return db.pmsItem.findUnique({
    where: { id, isActive: true },
  });
};

export const getAllImagesByItem = async (
  itemId: number,
): Promise<ItemImages[]> => {
  logger.info("entering::getAllImagesByItem::repository");
  return db.itemImages.findMany({
    where: {
      itemId,
      isActive: true,
    },
  });
};

export const getItemFromDb = async (): Promise<PmsItem[]> => {
  logger.info("entering::getItemFromDb::repository");
  return db.pmsItem.findMany({
    where: { isActive: true },
  });
};

export const getItemByCategoryIdFromDb = async (
  categoryId?: number,
): Promise<PmsItem[]> => {
  logger.info("entering::getItemFromDb::repository");
  return db.pmsItem.findMany({
    where: { isActive: true, ...(categoryId && { medCategoryId: categoryId }) },
  });
};

export const getItemFromDbByName = async (
  name: string,
): Promise<PmsItem | null> => {
  logger.info("entering::getItemFromDbByName::repository");
  return db.pmsItem.findFirst({
    where: { medicineName: name, isActive: true },
  });
};

export async function updateItemInDb(
  data: UpdateItemInput,
): Promise<PmsItem & { itemImages: ItemImages[] }> {
  const store = requestStorage.getStore();
  const setting = await settingsService.getSettings();
  const precision = setting?.itemPrecision ?? setting?.defaultPrecision ?? 2;
  return db.pmsItem.update({
    where: { id: Number(data.id) },
    data: {
      // ... your field mappings
      itemNumber:
        data.itemNumber ??
        (await uinServiceFactory.generateUIN(PmsUinShortCode.ITEM)),
      medicineName: data.medicineName.toString().trim(),
      medCategoryId: data.medCategoryId,
      medTypeId: data.medTypeId,
      medCompId: data.medCompId,
      medUnitId: data.medUnitId,
      packSizeId: data.packSizeId,
      boxSizeId: data.boxSizeId,
      manufacturerId: data.medManufacturerId,
      drugTypeId: data.drugTypeId,
      purchaseAmount: applyRound(
        data.purchaseAmount,
        RoundFormat.TO_FIXED,
        precision,
      ),
      saleAmount: applyRound(data.saleAmount, RoundFormat.TO_FIXED, precision),
      minOrderDetails: data.minOrderDetails,
      rackLocation: data.rackLocation,
      defaultDiscount: data.defaultDiscount,
      defaultB2BDiscount: data.defaultB2BDiscount,
      minStock: data.minStock,
      maxStock: data.maxStock,
      tax: data.tax,
      isAllowLooseSale: data.isAllowLooseSale,
      isLockDiscount: data.isLockDiscount,
      isLockB2BDiscount: data.isLockB2BDiscount,
      isReturnable: data.isReturnable,
      acceptOnlineOrder: data.acceptOnlineOrder,
      isSuggestionLock: data.isSuggestionLock,
      taxMethod: data.taxMethod,
      status: data.status,
      remark: data.remark,
      onHoldSale: data.onHoldSale,
      medPackingType: data.medPackingType,
      barcode: data.barcode,
      cess: data.cess,
      hsnCode: data.hsnCode,
      itemAlias: data.itemAlias,
      tags: data.tags,
      insurancePercentage: data.insurancePercentage,
      walkInPercentage: data.walkInPercentage,
      storageId: data.storageId,
      updatedBy: store?.user?.id,

      itemImages: {
        updateMany: {
          where: {
            itemId: Number(data.id),
          },
          data: {
            isActive: false,
          },
        },
        create:
          data.images?.map((img) => ({
            name: img.name,
            url: img.url,
            isPrimary: img.isPrimary ?? false,
          })) ?? [],
      },
    },
    include: {
      itemImages: true,
    },
  });
}

export const deleteItemFromDB = async (id: number) => {
  logger.info("entering::deleteItemFromDB::repository");
  const store = requestStorage.getStore();
  await db.pmsItem.update({
    where: {
      id,
    },
    data: {
      isActive: false,
      itemImages: {
        updateMany: {
          where: {
            itemId: id,
          },
          data: {
            isActive: false,
            deletedBy: store?.user?.id,
            deletedAt: new Date(),
          },
        },
      },
    },
  });
};
export const getCountItemsFromDb = async (itemIds: number[]) => {
  return db.pmsItem.findMany({
    where: {
      id: { in: itemIds },
      isActive: true,
    },
  });
};
export const getCountItemsByMedCategoryFromDb = async (id: number) => {
  return db.pmsItem.count({
    where: {
      medCategoryId: id,
      isActive: true,
    },
  });
};

export const getItemStocksByItemId = async (
  itemReq: GetItemStockRequest,
): Promise<PmsItemStock[]> => {
  logger.info("entering::getItemStocksByItemId::repository");

  return await db.$transaction(
    async (tx) => {
      const { id, warehouseId, branchId, isZeroQty } = itemReq;

      // const quantityCondition = isZeroQty ? {} : { quantity: { gt: 0 } };

      const stocks = await getItemStocksByLocation(
        tx,
        id,
        warehouseId,
        branchId,
        isZeroQty,
      );

      return stocks;
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export const getSlowMovingItemFromDb = async () => {
  logger.info("entering::getSlowMovingItemFromDb::repository");
  const store = requestStorage.getStore();
  const setting = await settingsService.getSettings();
  const timeInMonth = setting?.slowMovingTimeInMonth ?? 12;
  const slowMovingItems = await db.$queryRaw<SlowMovingItem[]>`
  SELECT i.*, MAX(s_old.bill_date) AS last_sold_date
  FROM pms_item i
  JOIN pms_sell_details sd_old ON sd_old.item_id = i.id
  JOIN pms_sell s_old ON s_old.id = sd_old.sell_id
  LEFT JOIN pms_sell_details sd_new ON sd_new.item_id = i.id
  LEFT JOIN pms_sell s_new ON s_new.id = sd_new.sell_id 
                           AND s_new.bill_date >= NOW() - INTERVAL ${timeInMonth} MONTH
                           AND s_new.is_active = TRUE
                           AND sd_new.is_active = TRUE
  WHERE s_old.bill_date < NOW() - INTERVAL ${timeInMonth} MONTH
    AND i.is_active = TRUE
    AND s_old.is_active = TRUE
    AND sd_old.is_active = TRUE
    AND s_new.id IS NULL
  GROUP BY i.id
`;
  logger.info("exiting::getSlowMovingItemFromDb::repository");
  return slowMovingItems;
};

export const getItemByFilterFromDb = async (
  filter: ItemFilter,
): Promise<(PmsItem & { itemImages: ItemImages[] })[]> => {
  const where: Prisma.PmsItemWhereInput = { isActive: true };

  if (filter.medCategoryId) {
    where.medCategoryId = filter.medCategoryId;
  }

  if (filter.medTypeId) {
    where.medTypeId = filter.medTypeId;
  }

  if (filter.medUnitId) {
    where.medUnitId = filter.medUnitId;
  }

  if (filter.status) {
    where.status = filter.status;
  }

  return db.pmsItem.findMany({
    where,
    include: { itemImages: true },
    orderBy: { createdAt: "desc" },
  });
};

export const activateItemInDb = async (id: number) => {
  logger.info("entering::activateItemInDb::repository");

  const updatedItem = await db.pmsItem.update({
    where: { id },
    data: {
      isActive: true,
      itemImages: {
        updateMany: {
          where: { itemId: id },
          data: { isActive: true },
        },
      },
    },
  });

  logger.info("exiting::activateItemInDb::repository");
  return updatedItem;
};

export const getItemNumberFromDb = async (
  itemNumber: string,
): Promise<PmsItem | null> => {
  logger.info("entering::getItemNumberFromDb::repository");
  return db.pmsItem.findFirst({
    where: { itemNumber, isActive: true },
  });
};

export const getItemsByIdsFromDb = async (
  itemIds: number[],
): Promise<(PmsItem & { itemImages: ItemImages[] })[]> => {
  return db.pmsItem.findMany({
    where: {
      id: { in: itemIds },
      isActive: true,
    },
    include: {
      itemImages: true,
    },
  });
};
