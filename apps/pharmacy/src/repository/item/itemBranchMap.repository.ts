import { API_TIMEOUT } from "@repo/shared";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import {
  BranchItemMap,
  PmsUinShortCode,
  Prisma,
  RoundFormat,
} from "@repo/db/generated/prisma/client";
import { createBatchJobInDb } from "../batch/batch.repository.js";
import { uinServiceFactory } from "@/config/core.config.js";
import {
  BranchItemMapAuditCreateInput,
  BranchItemMapAuditDetailsCreateInput,
  BranchToBranchPriceCopy,
  BranchWithSellAmountMap,
  createItemBranchMapInput,
  GetItemBranchPricing,
  ItemBranchMap,
  ItemWiseItemBranchMapUpdate,
} from "@/types/item/itemBranchMap.js";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit } from "av6-core-v2";
import { applyRound } from "av6-utils";
import { findDifferences } from "@repo/shared/utils/audit.utils.js";

import { settingsService } from "@/services/master/settings.service.js";

type Tx = Prisma.TransactionClient;

export const createItemBranchMapInDb = async (
  itemBranch: createItemBranchMapInput,
): Promise<void> => {
  logger.info("entering::createItemBranchInDb::repository");
  const store = requestStorage.getStore();
  const setting = await settingsService.getSettings();
  const precision = setting?.itemPrecision ?? setting?.defaultPrecision ?? 2;
  const omittedInput = customOmit<createItemBranchMapInput, "branchId">(
    itemBranch,
    ["branchId"],
  );
  const { branchId } = omittedInput.omitted;
  for (const branch of branchId) {
    await db.branchItemMap.create({
      data: {
        ...omittedInput.rest,
        branchId: branch,
        purchaseAmount:
          itemBranch.purchaseAmount !== undefined &&
          itemBranch.purchaseAmount !== null
            ? applyRound(
                itemBranch.purchaseAmount,
                RoundFormat.TO_FIXED,
                precision,
              )
            : undefined,
        saleAmount:
          itemBranch.saleAmount !== undefined && itemBranch.saleAmount !== null
            ? applyRound(itemBranch.saleAmount, RoundFormat.TO_FIXED, precision)
            : undefined,
        createdBy: store?.user?.id,
      },
    });
  }
};

export const updateItemBranchMapInDb = async (
  itemBranch: ItemBranchMap,
): Promise<void> => {
  logger.info("entering::createItemBranchInDb::repository");
  const store = requestStorage.getStore();
  const setting = await settingsService.getSettings();
  const precision = setting?.itemPrecision ?? setting?.defaultPrecision ?? 2;
  const omitted = customOmit<ItemBranchMap, "id">(itemBranch, ["id"]);
  await db.branchItemMap.update({
    where: {
      id: itemBranch.id,
    },
    data: {
      ...omitted.rest,
      purchaseAmount:
        itemBranch.purchaseAmount !== undefined &&
        itemBranch.purchaseAmount !== null
          ? applyRound(
              itemBranch.purchaseAmount,
              RoundFormat.TO_FIXED,
              precision,
            )
          : undefined,
      saleAmount:
        itemBranch.saleAmount !== undefined && itemBranch.saleAmount !== null
          ? applyRound(itemBranch.saleAmount, RoundFormat.TO_FIXED, precision)
          : undefined,
      updatedBy: store?.user?.id,
    },
  });
};

export const deleteItemBranchMapInDB = async (id: number) => {
  logger.info("entering::deleteItemBranchMapInDB::repository");
  return db.branchItemMap.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
};

export const getItemBranchMapByIdFromDb = async (
  id: number,
): Promise<BranchItemMap | null> => {
  logger.info("entering::getItemByIdFromDb::repository");
  return db.branchItemMap.findUnique({
    where: { id, isActive: true },
  });
};

export const getItemBranchMapByItemAndBranchIdFromDb = async (
  input: GetItemBranchPricing,
): Promise<BranchItemMap | null> => {
  logger.info("entering::getItemByIdFromDb::repository");
  return db.branchItemMap.findFirst({
    where: {
      itemId: input.itemId,
      branchId: input.branchId,
      isActive: true,
    },
  });
};

export const getItemBranchMapByBranchIdFromDb = async (
  branchId: number,
): Promise<BranchItemMap[]> => {
  logger.info("entering::getItemBranchMapByBranchIdFromDb::repository");
  return db.branchItemMap.findMany({
    where: {
      branchId,
      isActive: true,
    },
  });
};

export const getAllBranchMapFromDb = async (): Promise<BranchItemMap[]> => {
  logger.info("entering::getAllBranchMapFromDb::repository");
  return db.branchItemMap.findMany({
    where: {
      isActive: true,
    },
  });
};

export const countItemBranchMapByItemIdFromDb = async (
  itemId: number,
): Promise<number> => {
  logger.info("entering::countItemBranchMapByItemIdFromDb::repository");
  return db.branchItemMap.count({
    where: {
      itemId,
      isActive: true,
    },
  });
};

export const getItemBranchMapByItemIdFromDb = async (
  itemId: number,
): Promise<BranchWithSellAmountMap[]> => {
  logger.info("entering::getItemBranchMapByItemIdFromDb::repository");

  return db.pmsBranch.findMany({
    include: {
      branchSellAmountMap: {
        where: {
          itemId,
          isActive: true,
        },
        take: 1, // one mapping per branch
      },
    },
  });
};

export const UpdateItemWiseItemBranchMapInDb = async (
  input: ItemWiseItemBranchMapUpdate,
): Promise<void> => {
  logger.info("entering::UpdateItemWiseItemBranchMapInDb::repository");
  const store = requestStorage.getStore();
  await db.$transaction(
    async (tx) => {
      const prevRecords = await tx.branchItemMap.findMany({
        where: {
          itemId: input.itemId,
          isActive: true,
        },
        select: {
          id: true,
          saleAmount: true,
          insurancePercentage: true,
          walkInPercentage: true,
        },
      });
      for (const detail of input.details) {
        const prevRecord = prevRecords.find((elem) => elem.id === detail.id);
        const updatedRecord = await tx.branchItemMap.update({
          where: { id: detail.id },
          data: {
            insurancePercentage: detail.insurancePercentage,
            walkInPercentage: detail.walkInPercentage,
            saleAmount: detail.saleAmount,
            updatedBy: store?.user?.id,
          },
          select: {
            id: true,
            saleAmount: true,
            insurancePercentage: true,
            walkInPercentage: true,
          },
        });
        const audit = await CreateBranchItemMapAudit(tx, {
          ccId: input.ccId,
          toBranch: detail.branchId,
          itemId: input.itemId,
          actionBy: store?.user?.id,
        });
        const diff = findDifferences(prevRecord!, updatedRecord);
        for (const d of diff) {
          await CreateBranchItemMapAuditDetails(tx, {
            auditId: audit.id,
            field: d.field,
            changeFrom: d.changedFrom ? d.changedFrom : "",
            changeTo: d.changedTo ? d.changedTo : "",
          });
        }
      }
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export const copyBranchToBranchPriceMappingInDb = async (
  tx: Tx,
  toBranchId: number,
  sourceMapping: BranchItemMap,
  itemArray: BranchItemMap[],
) => {
  logger.info("entering::copyBranchToBranchPriceMappingInDb::repository");
  const store = requestStorage.getStore();
  let changed: Omit<
    BranchItemMap,
    | "branchId"
    | "isActive"
    | "createdAt"
    | "updatedAt"
    | "deletedAt"
    | "createdBy"
    | "updatedBy"
    | "deletedBy"
    | "defaultDiscount"
    | "defaultB2BDiscount"
    | "onHoldSale"
    | "tax"
    | "taxMethod"
    | "purchaseAmount"
  >;

  const omittedData = customOmit<
    BranchItemMap,
    | "id"
    | "branchId"
    | "itemId"
    | "isActive"
    | "createdAt"
    | "updatedAt"
    | "deletedAt"
    | "createdBy"
    | "updatedBy"
    | "deletedBy"
  >(sourceMapping, [
    "id",
    "branchId",
    "itemId",
    "isActive",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "createdBy",
    "updatedBy",
    "deletedBy",
  ]);

  const existingMapping = itemArray.find(
    (item) => item.itemId === sourceMapping.itemId,
  );

  if (existingMapping) {
    changed = await tx.branchItemMap.update({
      where: { id: existingMapping.id },
      data: {
        ...omittedData.rest,
        updatedBy: store?.user?.id,
      },
      select: {
        id: true,
        itemId: true,
        saleAmount: true,
        insurancePercentage: true,
        walkInPercentage: true,
      },
    });
  } else {
    changed = await tx.branchItemMap.create({
      data: {
        branchId: toBranchId,
        itemId: sourceMapping.itemId,
        ...omittedData.rest,
        createdBy: store?.user?.id,
      },
      select: {
        id: true,
        itemId: true,
        saleAmount: true,
        insurancePercentage: true,
        walkInPercentage: true,
      },
    });
  }

  return changed;
};

export const CreateBranchItemMapAudit = async (
  tx: Tx,
  input: BranchItemMapAuditCreateInput,
) => {
  logger.info("entering::CreateBranchItemMapAudit::repository");
  return tx.branchItemMapAudit.create({
    data: {
      ...input,
      fromBranch: input.fromBranch ?? null,
    },
  });
};

export const CreateBranchItemMapAuditDetails = async (
  tx: Tx,
  input: BranchItemMapAuditDetailsCreateInput,
) => {
  logger.info("entering::CreateBranchItemMapAuditDetails::repository");
  return tx.branchItemMapAuditDetails.create({
    data: input,
  });
};

export const CreateBranchItemMapExcelInDb = async (
  inp: Omit<Prisma.PmsBranchItemMapExcelUncheckedCreateInput, "batchJobId">[],
) => {
  logger.info("entering::CreateBranchItemMapExcelInDb::repository");
  const batchUin = await uinServiceFactory.generateUIN(
    PmsUinShortCode.BATCH_JOB,
  );
  return await db.$transaction(
    async (tx) => {
      const batch = await createBatchJobInDb(tx, {
        totalQty: inp.length,
        type: "ITEM_PRICING",
        processedQty: 0,
        batchJobNo: batchUin,
      });

      const data: Prisma.PmsBranchItemMapExcelUncheckedCreateInput[] = inp.map(
        (doc) => ({
          ...doc,
          batchJobId: batch.id,
        }),
      );

      await tx.pmsBranchItemMapExcel.createMany({
        data,
      });

      return batch;
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export async function branchItemMapBatchJob(batchJobId: number) {
  let skip = 0;
  let isDone = false;
  const store = requestStorage.getStore();
  const setting = await settingsService.getSettings();
  const BATCH_SIZE = setting?.batchSize ?? 100;
  await db.pmsBatchJob.update({
    where: { id: batchJobId },
    data: { status: "IN_PROGRESS" },
  });

  while (!isDone) {
    const batch = await db.pmsBranchItemMapExcel.findMany({
      skip,
      take: BATCH_SIZE,
      where: { batchJobId },
    });

    if (batch.length === 0) {
      isDone = true;
      break;
    }

    for (const item of batch) {
      try {
        await db.$transaction(
          async (tx) => {
            const existing = await db.branchItemMap.findFirst({
              where: {
                branchId: item.branchId,
                itemId: item.itemId,
                isActive: true,
              },
            });
            let changed: BranchItemMap;
            if (existing) {
              changed = await tx.branchItemMap.update({
                where: {
                  id: existing.id,
                },
                data: {
                  defaultDiscount: item.defaultDiscount,
                  defaultB2BDiscount: item.defaultB2BDiscount,
                  tax: item.tax,
                  taxMethod: item.taxMethod,
                  purchaseAmount: item.purchaseAmount,
                  saleAmount: item.saleAmount,
                  insurancePercentage: item.insurancePercentage,
                  walkInPercentage: item.walkInPercentage,
                  onHoldSale: item.onHoldSale,
                  updatedBy: store?.user?.id,
                },
              });
            } else {
              changed = await tx.branchItemMap.create({
                data: {
                  branchId: item.branchId,
                  itemId: item.itemId,
                  defaultDiscount: item.defaultDiscount,
                  defaultB2BDiscount: item.defaultB2BDiscount,
                  tax: item.tax,
                  taxMethod: item.taxMethod,
                  purchaseAmount: item.purchaseAmount,
                  saleAmount: item.saleAmount,
                  insurancePercentage: item.insurancePercentage,
                  walkInPercentage: item.walkInPercentage,
                  onHoldSale: item.onHoldSale,
                  updatedBy: store?.user?.id,
                },
              });
            }

            await tx.batchJobDetails.create({
              data: {
                batchId: batchJobId,
                refId: changed.id,
                refNo: item.itemNumber,
                rowTitle: item.itemName,
                status: "SUCCESS",
                rowNo: item.rowNo,
              },
            });
            await tx.pmsBatchJob.update({
              where: { id: batchJobId },
              data: {
                processedQty: { increment: 1 },
                successCount: { increment: 1 },
                status: "IN_PROGRESS",
              },
            });
          },
          {
            timeout: API_TIMEOUT,
          },
        );
      } catch (error) {
        console.error(
          `❌ Error processing batchItemMapExcel ${item.itemId}:`,
          error,
        );

        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "Unknown error";
        await db.batchJobDetails.create({
          data: {
            batchId: batchJobId,
            rowTitle: item.itemName,
            refNo: item.itemNumber,
            status: "FAILED",
            rowNo: item.rowNo,
            errorMsg: `${item.itemName} ---> ` + errorMessage,
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
  // ✅ Final status update
  const batchInfo = await db.pmsBatchJob.findUnique({
    where: { id: batchJobId },
  });
  await db.pmsBranchItemMapExcel.deleteMany({
    where: {
      batchJobId,
    },
  });
  if (batchInfo && batchInfo.totalQty === batchInfo.processedQty) {
    await db.pmsBatchJob.update({
      where: { id: batchJobId },
      data: {
        status: "COMPLETED",
      },
    });
  }
}

export async function copyBranchToBranchItemMapBatchJob(
  input: BranchToBranchPriceCopy,
) {
  let skip = 0;
  let isDone = false;
  const store = requestStorage.getStore();
  // const BATCH_SIZE = settingsService;
  const BATCH_SIZE = store?.settings?.batchSize || 100;
  const batchUin = await uinServiceFactory.generateUIN(
    PmsUinShortCode.BATCH_JOB,
  );

  const total = await db.branchItemMap.count({
    where: {
      branchId: input.fromBranchId,
      isActive: true,
    },
  });
  const batchJob = await db.pmsBatchJob.create({
    data: {
      totalQty: total,
      type: "ITEM_PRICING",
      processedQty: 0,
      batchJobNo: batchUin,
      status: "IN_PROGRESS",
    },
  });

  while (!isDone) {
    const batch = await db.branchItemMap.findMany({
      where: {
        branchId: input.fromBranchId,
        isActive: true,
      },
      skip,
      take: BATCH_SIZE,
    });

    if (batch.length === 0) {
      isDone = true;
      break;
    }
    const itemArray = await db.branchItemMap.findMany({
      where: {
        branchId: input.toBranchId,
        isActive: true,
      },
    });

    for (const item of batch) {
      try {
        await db.$transaction(
          async (tx) => {
            const prevRecord = await tx.branchItemMap.findFirst({
              where: {
                branchId: input.toBranchId,
                itemId: item.itemId,
                isActive: true,
              },
              select: {
                id: true,
                saleAmount: true,
                insurancePercentage: true,
                walkInPercentage: true,
              },
            });
            /*-------------------Upsert----------------------*/
            const changed = await copyBranchToBranchPriceMappingInDb(
              tx,
              input.toBranchId,
              item,
              itemArray,
            );

            /*---------------------------Audit----------------------------------*/
            const audit = await CreateBranchItemMapAudit(tx, {
              ccId: input.ccId,
              fromBranch: input.fromBranchId,
              toBranch: input.toBranchId,
              itemId: item.itemId,
              actionBy: store?.user?.id,
            });

            //If update then keep record of changed fields
            if (prevRecord) {
              const diff = findDifferences(prevRecord, changed);

              for (const d of diff) {
                await CreateBranchItemMapAuditDetails(tx, {
                  auditId: audit.id,
                  field: d.field,
                  changeFrom: d.changedFrom ? d.changedFrom : "",
                  changeTo: d.changedTo ? d.changedTo : "",
                });
              }
            }

            /*-------------------------------------------------------------------*/

            /*-------------------Batch Job----------------------*/
            await tx.batchJobDetails.create({
              data: {
                batchId: batchJob.id,
                refId: changed.id,
                refNo: String(changed.itemId),
                status: "SUCCESS",
                rowNo: item.id,
              },
            });
            await tx.pmsBatchJob.update({
              where: { id: batchJob.id },
              data: {
                processedQty: { increment: 1 },
                successCount: { increment: 1 },
                status: "IN_PROGRESS",
              },
            });
          },
          {
            timeout: API_TIMEOUT,
          },
        );
      } catch (error) {
        console.error(
          `❌ Error processing coping item pricing ${item.itemId}:`,
          error,
        );

        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "Unknown error";
        await db.batchJobDetails.create({
          data: {
            batchId: batchJob.id,
            rowTitle: String(item.itemId),
            status: "FAILED",
            rowNo: item.id,
            errorMsg: `${item.id} ---> ` + errorMessage,
          },
        });
        await db.pmsBatchJob.update({
          where: { id: batchJob.id },
          data: {
            processedQty: { increment: 1 },
            failureCount: { increment: 1 },
          },
        });
      }
    }
    skip += BATCH_SIZE;
  }
  // ✅ Final status update
  const batchInfo = await db.pmsBatchJob.findUnique({
    where: { id: batchJob.id },
  });
  if (batchInfo && batchInfo.totalQty === batchInfo.processedQty) {
    await db.pmsBatchJob.update({
      where: { id: batchJob.id },
      data: {
        status: "COMPLETED",
      },
    });
  }
}

export async function getMappedItemIdsForBranch(
  branchId: number,
  itemIds: number[],
) {
  return await db.branchItemMap.findMany({
    where: { branchId, itemId: { in: itemIds }, isActive: true },
  });
}
