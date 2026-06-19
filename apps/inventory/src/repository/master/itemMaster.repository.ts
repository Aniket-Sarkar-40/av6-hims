import { uinServiceFactory } from "@/config/core.config.js";
import {
  GetItemStockRequest,
  ItemMasterBatchJobInput,
  ItemMasterReq,
  ItemMasterUpdateReq,
} from "@/types/master/itemMaster.js";
import { db } from "@repo/db/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";

import { mapExcelRowToItemMasterReq } from "@/mapper/master/itemMaster.mapper.js";
import { createBatchJobInDb } from "@/repository/batch/batch.repository.js";
import { getItemStocksByLocationUserId } from "@/repository/stock/stock.repository.js";
import { createItemMasterServiceValidation } from "@/validations/service/master/itemMaster.service.validation.js";
import {
  InvItem,
  InvItemStock,
  InvUinShortCode,
  Prisma,
  RoundFormat,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { API_TIMEOUT } from "@repo/shared";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { applyRound } from "av6-utils";
import { initializeCache } from "@/config/redisClient.js";
import { ItemMasterExcelStagingRow } from "@/validations/request/master/itemMasterExcel.validation.js";
import { settingsService } from "@/services/master/settings.service.js";
import { itemCategoryService } from "@/services/master/itemCategory.service.js";
import { getItemCategoryByItemCategoryNameFromDb } from "@/repository/master/itemCategory.repository.js";
import { storageService } from "@/services/master/storage.service.js";
import { getStorageByStorageNameFromDb } from "@/repository/master/storage.repository.js";
import { defaultUnitMasterService } from "@/services/master/defaultUnitMaster.service.js";
import { getDefaultUnitMasterByNameFromDb } from "@/repository/master/defaultUnitMaster.repository.js";
import { unitMasterService } from "@/services/master/unitMaster.service.js";
import { getUnitMasterByUnitMasterPackNameFromDb } from "@/repository/master/unitMaster.repository.js";

const normalizeLookupKey = (value: string) => value.trim().toLowerCase();

const findActiveUnitMasterByName = (trimmed: string) =>
  db.invUnitMaster.findFirst({
    where: {
      isActive: true,
      OR: [{ packagingTypeName: trimmed }, { packagingSize: trimmed }],
    },
  });

const resolveItemCategoryId = async (
  name: string,
  rowNo: number,
  cache: Map<string, number>
): Promise<number> => {
  const key = normalizeLookupKey(name);
  const cached = cache.get(key);
  if (cached != null) return cached;

  const trimmed = name.trim();
  let record = await db.invItemCategory.findFirst({
    where: { name: trimmed, isActive: true },
  });

  if (!record) {
    try {
      record = await itemCategoryService.createItemCategory({ name: trimmed });
    } catch {
      record = await getItemCategoryByItemCategoryNameFromDb(trimmed);
      if (!record) {
        throw new Error(
          `Row ${rowNo}: Unable to create Item Category "${name}"`
        );
      }
    }
  }

  cache.set(key, record.id);
  return record.id;
};

const resolveStorageId = async (
  name: string | null | undefined,
  rowNo: number,
  cache: Map<string, number>
): Promise<number | null> => {
  if (!name?.trim()) return null;

  const key = normalizeLookupKey(name);
  const cached = cache.get(key);
  if (cached != null) return cached;

  const trimmed = name.trim();
  let record = await db.invStorage.findFirst({
    where: { name: trimmed, isActive: true },
  });

  if (!record) {
    try {
      record = await storageService.createStorage({ name: trimmed });
    } catch {
      record = await getStorageByStorageNameFromDb(trimmed);
      if (!record) {
        throw new Error(`Row ${rowNo}: Unable to create Storage "${name}"`);
      }
    }
  }

  cache.set(key, record.id);
  return record.id;
};

const resolveDefaultUnitMasterId = async (
  unitName: string,
  cache: Map<string, number>
): Promise<number> => {
  const key = normalizeLookupKey(`default:${unitName}`);
  const cached = cache.get(key);
  if (cached != null) return cached;

  const trimmed = unitName.trim();
  let record = await db.invDefaultUnitMaster.findFirst({
    where: { name: trimmed, isActive: true },
  });

  if (!record) {
    try {
      record = await defaultUnitMasterService.createDefaultUnitMaster({
        name: trimmed,
      });
    } catch {
      record = await getDefaultUnitMasterByNameFromDb(trimmed);
      if (!record) {
        const fallback = await db.invDefaultUnitMaster.findFirst({
          where: { isActive: true },
          orderBy: { id: "asc" },
        });
        if (!fallback) {
          throw new Error(
            `Unable to create Default Unit Master for "${unitName}"`
          );
        }
        record = fallback;
      }
    }
  }

  cache.set(key, record.id);
  return record.id;
};

const resolveUnitId = async (
  name: string,
  rowNo: number,
  cache: Map<string, number>,
  defaultUnitCache: Map<string, number>
): Promise<number> => {
  const key = normalizeLookupKey(name);
  const cached = cache.get(key);
  if (cached != null) return cached;

  const trimmed = name.trim();
  let record = await findActiveUnitMasterByName(trimmed);

  if (!record) {
    const defaultUnitMasterId = await resolveDefaultUnitMasterId(
      trimmed,
      defaultUnitCache
    );
    try {
      record = await unitMasterService.createUnitMaster({
        packagingTypeName: trimmed,
        packagingSize: trimmed,
        defaultValue: 1,
        defaultUnitMasterId,
      });
    } catch {
      record =
        (await findActiveUnitMasterByName(trimmed)) ??
        (await getUnitMasterByUnitMasterPackNameFromDb(trimmed));
      if (!record) {
        throw new Error(`Row ${rowNo}: Unable to create Unit "${name}"`);
      }
    }
  }

  cache.set(key, record.id);
  return record.id;
};

export const createItemMasterInDb = async (
  itemMaster: ItemMasterReq
): Promise<InvItem> => {
  logger.info("entering::createItemMasterInDb::repository");
  const store = requestStorage.getStore();
  const settings = await settingsService.getSettings();
  const precision = settings?.itemPrecision || settings?.defaultPrecision || 2;
  const item = await db.invItem.create({
    data: {
      ...itemMaster,
      basePrice: applyRound(
        Number(itemMaster.basePrice),
        RoundFormat.TO_FIXED,
        precision
      ),
      itemCode:
        itemMaster.itemCode ??
        (await uinServiceFactory.generateUIN(InvUinShortCode.ITEM)),
      createdBy: store?.user?.id,
    },
  });

  return item;
};

export const updateItemMasterInDb = async (
  itemMaster: ItemMasterUpdateReq
): Promise<InvItem> => {
  logger.info("entering::updateItemMasterInDb::repository");
  const store = requestStorage.getStore();
  const settings = await settingsService.getSettings();
  const precision = settings?.itemPrecision || settings?.defaultPrecision || 2;
  return db.invItem.update({
    where: { id: itemMaster.id },
    data: {
      ...itemMaster,
      basePrice: applyRound(
        Number(itemMaster.basePrice),
        RoundFormat.TO_FIXED,
        precision
      ),
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
  item: string
): Promise<InvItem | null> => {
  logger.info("entering::getItemMasterByItemMasterNameFromDb::repository");
  return db.invItem.findFirst({
    where: { item, isActive: true },
  });
};

export const getItemMasterByItemMasterCodeFromDb = async (
  itemCode: string
): Promise<InvItem | null> => {
  logger.info("entering::getItemMasterByItemMasterNameFromDb::repository");
  return db.invItem.findFirst({
    where: { itemCode, isActive: true },
  });
};

export const getItemMasterByIdFromDb = async (
  id: number
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
    include: {
      unit: true,
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
  itemReq: GetItemStockRequest
): Promise<InvItemStock[]> => {
  logger.info("entering::getItemStocksByItemId::repository");

  return await db.$transaction(async (tx) => {
    const { id, userId, isZeroQty, ccId } = itemReq;

    // const quantityCondition = isZeroQty ? {} : { quantity: { gt: 0 } };

    const stocks = await getItemStocksByLocationUserId(
      tx,
      id,
      userId,
      isZeroQty,
      ccId
    );

    return stocks;
  });
};

export const createItemMasterExcelInDb = async (
  inp: ItemMasterExcelStagingRow[]
) => {
  logger.info("entering::createItemMasterExcelInDb::repository");
  const batchJobNo = await uinServiceFactory.generateUIN(
    InvUinShortCode.BATCH_JOB
  );
  const settings = requestStorage.getStore()?.settings;
  const precision = settings?.defaultPrecision || 2;

  return await db.$transaction(
    async (tx) => {
      const batchJob = await createBatchJobInDb(tx, {
        totalQty: inp.length,
        type: "ITEM",
        status: "PENDING",
        batchJobNo,
      });

      const rows: Prisma.InvItemMasterExcelUncheckedCreateInput[] = [];

      for (const record of inp) {
        const itemCode =
          record.itemCode?.trim() ||
          (await uinServiceFactory.generateUIN(InvUinShortCode.ITEM));

        rows.push({
          ...record,
          item: record.item.trim(),
          itemCode,
          itemCategory: record.itemCategory.trim(),
          storage: record.storage?.trim() ?? null,
          unit: record.unit.trim(),
          basePrice:
            record.basePrice != null
              ? new Prisma.Decimal(
                  applyRound(
                    Number(record.basePrice),
                    RoundFormat.TO_FIXED,
                    precision
                  )
                )
              : null,
          batchJobId: batchJob.id,
        });
      }

      await tx.invItemMasterExcel.createMany({ data: rows });

      return batchJob;
    },
    {
      timeout: API_TIMEOUT,
    }
  );
};

/** @deprecated Use createItemMasterExcelInDb */
export const CreateItemMasterExcelInDb = createItemMasterExcelInDb;

export async function ItemMasterBatchJob(input: ItemMasterBatchJobInput) {
  const { batchJobId } = input;

  let skip = 0;
  let isDone = false;
  const store = requestStorage.getStore();
  const BATCH_SIZE = store?.settings?.batchSize || 100;

  const itemCategoryCache = new Map<string, number>();
  const storageCache = new Map<string, number>();
  const unitCache = new Map<string, number>();

  const defaultUnitCache = new Map<string, number>();

  await db.batchJob.update({
    where: { id: batchJobId },
    data: { status: "IN_PROGRESS" },
  });

  while (!isDone) {
    const batch = await db.invItemMasterExcel.findMany({
      where: { batchJobId },
      orderBy: { rowNo: "asc" },
      skip,
      take: BATCH_SIZE,
    });

    if (batch.length === 0) {
      isDone = true;
      break;
    }

    for (const row of batch) {
      try {
        const resolved = {
          itemCategoryId: await resolveItemCategoryId(
            row.itemCategory,
            row.rowNo,
            itemCategoryCache
          ),
          storageId: await resolveStorageId(
            row.storage,
            row.rowNo,
            storageCache
          ),
          unitId: await resolveUnitId(
            row.unit,
            row.rowNo,
            unitCache,
            defaultUnitCache
          ),
        };

        const itemReq = mapExcelRowToItemMasterReq(row, resolved);
        await createItemMasterServiceValidation(itemReq);
        const created = await createItemMasterInDb(itemReq);

        await db.batchJobDetails.create({
          data: {
            batchId: batchJobId,
            refId: created.id,
            refNo: created.itemCode ?? String(created.id),
            rowTitle: created.item,
            status: "SUCCESS",
            rowNo: row.rowNo,
          },
        });

        await db.batchJob.update({
          where: { id: batchJobId },
          data: {
            processedQty: { increment: 1 },
            successCount: { increment: 1 },
            status: "IN_PROGRESS",
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === "string"
            ? error
            : "Unknown error";

        await db.batchJobDetails.create({
          data: {
            batchId: batchJobId,
            rowTitle: row.item,
            refNo: row.itemCode ?? String(row.rowNo),
            status: "FAILED",
            rowNo: row.rowNo,
            errorMsg: `${row.item} ---> ${errorMessage}`,
          },
        });

        await db.batchJob.update({
          where: { id: batchJobId },
          data: {
            processedQty: { increment: 1 },
            failureCount: { increment: 1 },
          },
        });
      }
    }

    skip += BATCH_SIZE;
  }

  const batchInfo = await db.batchJob.findUnique({
    where: { id: batchJobId },
  });

  await db.invItemMasterExcel.deleteMany({
    where: { batchJobId },
  });

  if (batchInfo && batchInfo.totalQty === batchInfo.processedQty) {
    await db.batchJob.update({
      where: { id: batchJobId },
      data: {
        status: "COMPLETED",
      },
    });
  }

  await initializeCache();
}
