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

export const createItemMasterInDb = async (
  itemMaster: ItemMasterReq
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
  itemMaster: ItemMasterUpdateReq
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
    const { id, userId, isZeroQty } = itemReq;

    // const quantityCondition = isZeroQty ? {} : { quantity: { gt: 0 } };

    const stocks = await getItemStocksByLocationUserId(
      tx,
      id,
      userId,
      isZeroQty
    );

    return stocks;
  });
};

export const CreateItemMasterExcelInDb = async (
  inp: Prisma.InvItemMasterExcelCreateInput[]
) => {
  logger.info("entering::CreateItemMasterExcelInDb::repository");
  const batchUin = await uinServiceFactory.generateUIN(
    InvUinShortCode.BATCH_JOB
  );
  const settings = requestStorage.getStore()?.settings;
  const precision = settings?.defaultPrecision || 2;

  return await db.$transaction(
    async (tx) => {
      const roundedData = inp.map((record) => ({
        ...record,
        basePrice:
          record.basePrice != null
            ? applyRound(record.basePrice, RoundFormat.TO_FIXED, precision)
            : undefined,
      }));

      const total = await tx.invItemMasterExcel.createMany({
        data: roundedData,
      });

      return await createBatchJobInDb(tx, {
        totalQty: total.count,
        type: "ITEM",
        status: "PENDING",
        batchJobNo: batchUin,
      });
    },
    {
      timeout: API_TIMEOUT,
    }
  );
};

export async function ItemMasterBatchJob(input: ItemMasterBatchJobInput) {
  const { batchJobId } = input;

  let skip = 0;
  let isDone = false;
  const store = requestStorage.getStore();
  const BATCH_SIZE = store?.settings?.batchSize || 100;

  await db.batchJob.update({
    where: { id: batchJobId },
    data: { status: "IN_PROGRESS" },
  });

  while (!isDone) {
    const batch = await db.invItemMasterExcel.findMany({
      skip,
      take: BATCH_SIZE,
    });

    if (batch.length === 0) {
      isDone = true;
      break;
    }

    for (const row of batch) {
      try {
        const itemReq = mapExcelRowToItemMasterReq(row);
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

  await db.invItemMasterExcel.deleteMany();

  if (batchInfo && batchInfo.totalQty === batchInfo.processedQty) {
    await db.batchJob.update({
      where: { id: batchJobId },
      data: {
        status: "COMPLETED",
      },
    });
  }
}
