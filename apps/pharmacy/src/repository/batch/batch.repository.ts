import { requestStorage } from "@repo/platform/config/requestContext.js";
import {
  BatchDetailsInput,
  BatchJobInput,
  CacheMaps,
} from "@/types/batch/batch.js";
import { addInitialStock } from "../stock/stock.repository.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  PmsItem,
  PmsUinShortCode,
  Prisma,
  PrismaClient,
  RoundFormat,
} from "@repo/db/generated/prisma/client";
import { db } from "@repo/db";
import { API_TIMEOUT } from "@repo/shared";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { applyRound } from "av6-utils";
import { initializeCache } from "@/config/redisClient.js";
import { uinServiceFactory } from "@/config/core.config.js";
import { settingsService } from "@/services/master/settings.service.js";
export type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
type Tx = Prisma.TransactionClient;

export const createItemExcelInDb = async (
  inp: Omit<Prisma.ItemExcelUncheckedCreateInput, "batchJobId">[],
) => {
  logger.info("entering::createItemExcelInDb::repository");

  return await db.$transaction(
    async (tx) => {
      const batchUin = await uinServiceFactory.generateUIN(
        PmsUinShortCode.BATCH_JOB,
      );

      // Create the batch record first
      const batch = await createBatchJobInDb(tx, {
        totalQty: inp.length,
        type: "ITEM",
        processedQty: 0,
        batchJobNo: batchUin,
      });

      // Corrected: loop over inp (not data)
      const data: Prisma.ItemExcelUncheckedCreateInput[] = [];

      for (const item of inp) {
        const provided = item.itemNumber?.toString().trim();
        const effectiveItemNumber =
          provided && provided.length > 0
            ? provided
            : await uinServiceFactory.generateUIN(PmsUinShortCode.ITEM);

        data.push({
          ...item,
          medicineName: item.medicineName?.toString().trim(),
          itemNumber: effectiveItemNumber,
          batchJobId: batch.id,
        });
      }

      await tx.itemExcel.createMany({
        data,
      });

      return batch;
    },
    { timeout: API_TIMEOUT },
  );
};

export const createBatchJobInDb = async (tx: Tx, inp: BatchJobInput) => {
  logger.info("entering::createBatchJobInDb::repository");
  return tx.pmsBatchJob.create({
    data: inp,
  });
};

export const createBatchDetailsInDb = async (
  tx: Tx,
  inp: BatchDetailsInput,
) => {
  logger.info("entering::createBatchDetailsInDb::repository");
  return tx.batchJobDetails.create({
    data: inp,
  });
};

export const findOrCreateWithCache = async (
  modelName: keyof typeof db,
  value: string,
  cache: Map<string, number>,
): Promise<number> => {
  if (cache.has(value)) {
    return cache.get(value)!;
  }

  // @ts-expect-error - We are controlling the modelName and know it's a valid Prisma model
  const existing = await db[modelName].findFirst({
    where: { name: value },
    select: { id: true },
  });

  if (existing) {
    cache.set(value, existing.id);
    return existing.id;
  }

  if (modelName === "medPackage") {
    if (isNaN(Number(value))) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_FIELD", "Pack Size"),
      );
    }
  }

  // @ts-expect-error - We are controlling the modelName and know it's a valid Prisma model
  const created = await db[modelName].create({
    data: { name: value },
    select: { id: true },
  });

  cache.set(value, created.id);
  return created.id;
};

export async function processBatchJob(
  batchJobId: number,
  type?: "Warehouse" | "Branch",
  ccId?: number,
) {
  let skip = 0;
  let isDone = false;
  const setting = await settingsService.getSettings();
  const BATCH_SIZE = setting?.batchSize ?? 100;

  const precision = setting?.defaultPrecision ?? 2;

  // In-memory cache for type mapping
  const cache: CacheMaps = {
    medCategory: new Map(),
    medType: new Map(),
    medComp: new Map(),
    medUnit: new Map(),
    manufacturer: new Map(),
    packSize: new Map(),
    drugType: new Map(),
    boxSize: new Map(),
  };

  await db.pmsBatchJob.update({
    where: { id: batchJobId },
    data: { status: "IN_PROGRESS" },
  });

  while (!isDone) {
    const batch = await db.itemExcel.findMany({
      skip,
      take: BATCH_SIZE,
      where: {
        batchJobId,
      },
    });

    if (batch.length === 0) {
      isDone = true;
      break;
    }

    for (const item of batch) {
      try {
        const existingMed = await db.pmsItem.findFirst({
          where: {
            isActive: true,
            OR: [
              { medicineName: item.medicineName },
              { itemNumber: item.itemNumber },
            ],
          },
        });

        const medCategoryId = await findOrCreateWithCache(
          "medCategory",
          item.medCategory,
          cache.medCategory,
        );
        const medTypeId = await findOrCreateWithCache(
          "medType",
          item.medType,
          cache.medType,
        );
        const medCompId = await findOrCreateWithCache(
          "medicineCompo",
          item.medComp,
          cache.medComp,
        );
        const medUnitId = await findOrCreateWithCache(
          "medicineUnit",
          item.medUnit,
          cache.medUnit,
        );
        const manufacturerId = await findOrCreateWithCache(
          "manufacture",
          item.manufacturer,
          cache.manufacturer,
        );
        const packSizeId = await findOrCreateWithCache(
          "medPackage",
          item.packSize,
          cache.packSize,
        );
        const drugTypeId = await findOrCreateWithCache(
          "medDrug",
          item.drugType,
          cache.drugType,
        );
        const boxSizeId = await findOrCreateWithCache(
          "boxSize",
          item.boxSize ?? "",
          cache.boxSize,
        );
        let createdItem: PmsItem | null = null;
        if (!existingMed) {
          // Create item with IDs
          createdItem = await db.pmsItem.create({
            data: {
              boxSizeId,
              medicineName: item.medicineName,
              medCategoryId,
              medTypeId,
              medCompId,
              medUnitId,
              manufacturerId,
              packSizeId,
              drugTypeId,
              itemNumber:
                item.itemNumber ??
                (await uinServiceFactory.generateUIN(PmsUinShortCode.ITEM)),
              purchaseAmount: applyRound(
                item.purchaseAmount.toNumber(),
                RoundFormat.TO_FIXED,
                precision,
              ),
              saleAmount: applyRound(
                item.saleAmount.toNumber(),
                RoundFormat.TO_FIXED,
                precision,
              ),
              tax: item.tax,
              taxMethod: item.taxMethod,
              defaultDiscount: item.defaultDiscount,
              defaultB2BDiscount: item.defaultB2BDiscount,
              minStock: item.minStock,
              maxStock: item.maxStock,
              acceptOnlineOrder: item.acceptOnlineOrder,
              isAllowLooseSale: item.isAllowLooseSale,
              cess: item.cess || undefined,
              hsnCode: item.hsnCode || undefined,
              itemAlias: item.itemAlias || undefined,
              rackLocation: item.rackLocation || undefined,
              walkInPercentage: item.walkInPercentage,
              insurancePercentage: item.insurancePercentage,
              remark: item.remark || undefined,
              isReturnable: item.isReturnable,
              medPackingType: item.medPackingType,
            },
          });
        } else {
          createdItem = await db.pmsItem.update({
            where: { id: existingMed.id },
            data: {
              boxSizeId,
              medicineName: item.medicineName,
              medCategoryId,
              medTypeId,
              medCompId,
              medUnitId,
              manufacturerId,
              packSizeId,
              drugTypeId,
              itemNumber: item.itemNumber ?? existingMed.itemNumber,
              purchaseAmount: applyRound(
                item.purchaseAmount.toNumber(),
                RoundFormat.TO_FIXED,
                precision,
              ),
              saleAmount: applyRound(
                item.saleAmount.toNumber(),
                RoundFormat.TO_FIXED,
                precision,
              ),
              tax: item.tax,
              taxMethod: item.taxMethod,
              defaultDiscount: item.defaultDiscount,
              defaultB2BDiscount: item.defaultB2BDiscount,
              minStock: item.minStock,
              maxStock: item.maxStock,
              acceptOnlineOrder: item.acceptOnlineOrder,
              isAllowLooseSale: item.isAllowLooseSale,
              cess: item.cess || undefined,
              hsnCode: item.hsnCode || undefined,
              itemAlias: item.itemAlias || undefined,
              rackLocation: item.rackLocation || undefined,
              walkInPercentage: item.walkInPercentage,
              insurancePercentage: item.insurancePercentage,
              remark: item.remark || undefined,
              isReturnable: item.isReturnable,
              medPackingType: item.medPackingType,
            },
          });
        }

        const batchDet = await db.batchJobDetails.create({
          data: {
            batchId: batchJobId,
            refId: createdItem?.id,
            refNo: createdItem?.itemNumber,
            rowTitle: createdItem?.medicineName,
            status: "SUCCESS",
            rowNo: item.rowNo,
            type: existingMed ? "UPDATE" : "CREATE",
          },
        });

        const batchJob = await db.pmsBatchJob.update({
          where: { id: batchJobId },
          data: {
            processedQty: { increment: 1 },
            successCount: { increment: 1 },
            status: "IN_PROGRESS",
          },
        });
        if (createdItem?.id && item.quantity && ccId) {
          await addInitialStock(
            {
              itemId: createdItem?.id,
              quantity: item.quantity,
              batchNo: item.batchNo,
              expiryDate: item.expiryDate,
              isFoc: false,
              branchId: type === "Branch" ? ccId : undefined,
              warehouseId: type === "Warehouse" ? ccId : undefined,
            },
            {
              operation: "STOCK_INITIALIZATION",
              refDate: new Date(),
              refDetailsId: batchDet.id,
              refId: batchJobId,
              refNo: batchJob.batchJobNo,
            },
          );
        }
      } catch (error) {
        console.error(`Error processing itemExcel ${item.id}:`, error);

        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "Unknown error";

        await db.batchJobDetails.create({
          data: {
            batchId: batchJobId,
            rowTitle: item.medicineName,
            status: "FAILED",
            errorMsg: `${item.medicineName} ---> ` + errorMessage,
            rowNo: item.rowNo,
          },
        });

        await db.pmsBatchJob.update({
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

  const batchInfo = await db.pmsBatchJob.findUnique({
    where: { id: batchJobId },
  });

  await db.itemExcel.deleteMany({
    where: {
      batchJobId,
    },
  });

  if (batchInfo && batchInfo.totalQty === batchInfo.processedQty) {
    await db.pmsBatchJob.update({
      where: { id: batchJobId },
      data: { status: "COMPLETED" },
    });
  }

  await initializeCache();
}
