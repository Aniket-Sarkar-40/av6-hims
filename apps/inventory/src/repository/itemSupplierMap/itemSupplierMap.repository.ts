import { uinServiceFactory } from "@/config/core.config.js";
import {
  ItemSuppierMapDTO,
  ItemSupplierMapCreateInput,
  ItemSupplierMaplBatchJobInput,
  ItemSupplierMapUpdateInput,
} from "@/types/itemSupplierMap/itemSupplierMap.js";
import { GetItemReq } from "@/types/master/itemMaster.js";
import { db } from "@repo/db/client";
import {
  InvItemSupplierMapping,
  InvUinShortCode,
  Prisma,
  RoundFormat,
} from "@repo/db/generated/prisma/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { applyRound, customOmit, findDifferences } from "av6-utils";
import {
  CreateItemSupplierMapAudit,
  CreateItemSupplierMapAuditDetails,
} from "../audit/commonAudit.repository.js";
import { createBatchJobInDb } from "../batch/batch.repository.js";

export async function createItemSupplierMapInDb(
  data: ItemSupplierMapCreateInput
): Promise<InvItemSupplierMapping> {
  logger.info("entering::createItemSupplierMapInDb::repository");
  const store = requestStorage.getStore();
  const precision = requestStorage.getStore()?.settings?.defaultPrecision || 2;
  const itemSupplierMap = await db.invItemSupplierMapping.create({
    data: {
      ...data,
      purchasePrice: applyRound(
        data.purchasePrice,
        RoundFormat.TO_FIXED,
        precision
      ),
      validUpto: data.validUpto ? new Date(data.validUpto) : null,
      createdBy: store?.user?.id,
    },
  });
  logger.info("exiting::createItemSupplierMapInDb::repository");
  return itemSupplierMap;
}

export async function updateItemSupplierMapInDb(
  data: ItemSupplierMapUpdateInput
): Promise<InvItemSupplierMapping> {
  logger.info("entering::updateItemSupplierMapInDb::repository");
  const store = requestStorage.getStore();
  const precision = requestStorage.getStore()?.settings?.defaultPrecision || 2;
  return await db.$transaction(async (tx) => {
    const omittedData = customOmit<
      ItemSupplierMapUpdateInput,
      "id" | "existing"
    >(data, ["id", "existing"]);
    const itemSupplierMap = await tx.invItemSupplierMapping.update({
      where: {
        id: data.id,
      },
      data: {
        ...omittedData.rest,
        purchasePrice: applyRound(
          data.purchasePrice,
          RoundFormat.TO_FIXED,
          precision
        ),
        validUpto: omittedData.rest.validUpto
          ? new Date(omittedData.rest.validUpto)
          : null,
        updatedBy: store?.user?.id,
      },
    });
    /*---------------------------Audit----------------------------------*/
    const existing = data.existing;
    const omittedResponse = customOmit<
      InvItemSupplierMapping,
      | "createdBy"
      | "updatedBy"
      | "isActive"
      | "deletedAt"
      | "deletedBy"
      | "createdAt"
      | "updatedAt"
    >(itemSupplierMap, [
      "createdBy",
      "updatedBy",
      "isActive",
      "deletedAt",
      "deletedBy",
      "createdAt",
      "updatedAt",
    ]);
    const audit = await CreateItemSupplierMapAudit(tx, {
      ccId: data.ccId,
      to: data.supplierId,
      itemId: data.itemId,
      actionBy: store?.user?.id,
    });

    const updatedItemSupplier: ItemSuppierMapDTO = {
      ...omittedResponse.rest,
      item: existing.item,
      supplier: existing.supplier,
      collectionCenter: existing.collectionCenter,
    };

    const diff = findDifferences(existing, updatedItemSupplier);

    for (const d of diff) {
      await CreateItemSupplierMapAuditDetails(tx, {
        auditId: audit.id,
        field: d.field,
        changeFrom: d.changedFrom ? d.changedFrom : "",
        changeTo: d.changedTo ? d.changedTo : "",
      });
    }
    /*-------------------------------------------------------------------*/
    logger.info("exiting::updateItemSupplierMapInDb::repository");
    return itemSupplierMap;
  });
}

export async function getItemSupplierMapByIdFromDb(
  id: number
): Promise<InvItemSupplierMapping | null> {
  logger.info("entering::getItemSupplierMapByIdFromDb::repository");

  const itemSupplierMap = await db.invItemSupplierMapping.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
  logger.info("exiting::getItemSupplierMapByIdFromDb::repository");
  return itemSupplierMap;
}

export async function getItemSupplierMapByItemAndSupplierFromDb(
  itemId: number,
  supplierId: number
): Promise<InvItemSupplierMapping | null> {
  logger.info(
    "entering::getItemSupplierMapByItemAndSupplierFromDb::repository"
  );

  const itemSupplierMap = await db.invItemSupplierMapping.findFirst({
    where: {
      itemId,
      supplierId,
      isActive: true,
    },
  });
  logger.info("exiting::getItemSupplierMapByItemAndSupplierFromDb::repository");
  return itemSupplierMap;
}

export async function getAllItemSupplierMapFromDb(): Promise<
  InvItemSupplierMapping[]
> {
  logger.info("entering::getAllItemSupplierMapFromDb::repository");

  const itemSupplierMap = await db.invItemSupplierMapping.findMany({
    where: {
      isActive: true,
    },
  });
  logger.info("exiting::getAllItemSupplierMapFromDb::repository");
  return itemSupplierMap;
}

export async function deleteItemSupplierMapByIdFromDb(
  id: number
): Promise<InvItemSupplierMapping | null> {
  logger.info("entering::deleteItemSupplierMapByIdFromDb::repository");
  const store = requestStorage.getStore();
  const itemSupplierMap = await db.invItemSupplierMapping.update({
    where: {
      id,
    },
    data: {
      isActive: false,
      deletedBy: store?.user?.id,
    },
  });
  logger.info("exiting::deleteItemSupplierMapByIdFromDb::repository");
  return itemSupplierMap;
}

export const CreateItemSupplierMapExcelInDb = async (
  inp: Prisma.InvItemSupplierMapExcelCreateInput[]
) => {
  logger.info("entering::CreateItemSupplierMapExcelInDb::repository");
  const batchUin = await uinServiceFactory.generateUIN(
    InvUinShortCode.BATCH_JOB
  );
  const settings = requestStorage.getStore()?.settings;
  const precision = settings?.defaultPrecision || 2;
  return await db.$transaction(
    async (tx) => {
      const roundedData = inp.map((record) => ({
        ...record,
        supplierPrice: applyRound(
          record.supplierPrice ?? 0,
          RoundFormat.TO_FIXED,
          precision
        ),
      }));

      const total = await tx.invItemSupplierMapExcel.createMany({
        data: roundedData,
      });

      return await createBatchJobInDb(tx, {
        totalQty: total.count,
        type: "ITEM_PRICING",
        status: "PENDING",
        batchJobNo: batchUin,
      });
    },
    {
      timeout: API_TIMEOUT,
    }
  );
};

export async function ItemSupplierMapBatchJob(
  input: ItemSupplierMaplBatchJobInput
) {
  const { batchJobId, supplierId, ccId } = input;

  let skip = 0;
  let isDone = false;
  const store = requestStorage.getStore();
  const BATCH_SIZE = store?.settings?.batchSize || 100;
  await db.invBatchJob.update({
    where: { id: batchJobId },
    data: { status: "IN_PROGRESS" },
  });

  while (!isDone) {
    const batch = await db.invItemSupplierMapExcel.findMany({
      skip,
      take: BATCH_SIZE,
    });

    if (batch.length === 0) {
      isDone = true;
      break;
    }

    for (const item of batch) {
      try {
        if (item.supplierPrice > 0) {
          const existing = await db.invItemSupplierMapping.findFirst({
            where: {
              supplierId,
              ccId,
              itemId: item.itemId,
              isActive: true,
            },
          });
          let changed: InvItemSupplierMapping;
          if (existing) {
            changed = await db.invItemSupplierMapping.update({
              where: {
                id: existing.id,
              },
              data: {
                ccId,
                supplierId,
                purchasePrice: item.supplierPrice,
                updatedBy: store?.user?.id,
              },
            });
          } else {
            changed = await db.invItemSupplierMapping.create({
              data: {
                itemId: item.itemId,
                ccId,
                supplierId,
                purchasePrice: item.supplierPrice,
                createdBy: store?.user?.id,
              },
            });
          }
          /*---------------------------Audit----------------------------------*/
          const audit = await db.invItemSupplierMapAudit.create({
            data: {
              ccId: input.ccId,
              to: input.supplierId,
              itemId: item.itemId,
              actionBy: store?.user?.id,
            },
          });

          //If updated then keep record of changed fields
          if (existing) {
            const omittedExisting = customOmit(existing, [
              "id",
              "createdBy",
              "updatedBy",
              "deletedBy",
              "createdAt",
              "updatedAt",
              "deletedAt",
              "entryOn",
              "validUpto",
              "isActive",
            ]);
            const omittedChanged = customOmit(changed, [
              "id",
              "createdBy",
              "updatedBy",
              "deletedBy",
              "createdAt",
              "updatedAt",
              "deletedAt",
              "entryOn",
              "validUpto",
              "isActive",
            ]);
            const diff = findDifferences(
              omittedExisting.rest,
              omittedChanged.rest
            );

            for (const d of diff) {
              await db.invItemSuppierMapAuditDetails.create({
                data: {
                  auditId: audit.id,
                  field: d.field,
                  changeFrom: d.changedFrom ? d.changedFrom : "",
                  changeTo: d.changedTo ? d.changedTo : "",
                },
              });
            }
          }
          await db.batchJobDetails.create({
            data: {
              batchId: batchJobId,
              refId: changed.id,
              refNo: item.itemCode,
              rowTitle: item.itemName,
              status: "SUCCESS",
              rowNo: item.rowNo,
            },
          });
          await db.invBatchJob.update({
            where: { id: batchJobId },
            data: {
              processedQty: { increment: 1 },
              successCount: { increment: 1 },
              status: "IN_PROGRESS",
            },
          });
        } else {
          await db.batchJobDetails.create({
            data: {
              batchId: batchJobId,
              refNo: item.itemCode,
              rowTitle: item.itemName,
              status: "FAILED",
              rowNo: item.rowNo,
              errorMsg: `${item.itemName} ---> ` + "Supplier Price is 0",
            },
          });
          await db.invBatchJob.update({
            where: { id: batchJobId },
            data: {
              processedQty: { increment: 1 },
              failureCount: { increment: 1 },
            },
          });
        }
        /*-------------------------------------------------------------------*/
      } catch (error) {
        console.error(
          `❌ Error processing batchItemMapExcel ${item.itemId}:`,
          error
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
            refNo: item.itemCode,
            status: "FAILED",
            rowNo: item.rowNo,
            errorMsg: `${item.itemName} ---> ` + errorMessage,
          },
        });
        await db.invBatchJob.update({
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
  const batchInfo = await db.invBatchJob.findUnique({
    where: { id: batchJobId },
  });
  await db.invItemSupplierMapExcel.deleteMany();
  if (batchInfo && batchInfo.totalQty === batchInfo.processedQty) {
    await db.invBatchJob.update({
      where: { id: batchJobId },
      data: {
        status: "COMPLETED",
      },
    });
  }
}

export async function getItemSupplierMapByItemIdAndSupplierIdFromDb(
  itemIds: number[],
  supplierId: number
): Promise<InvItemSupplierMapping | null> {
  logger.info(
    "entering::getItemSupplierMapByItemAndSupplierFromDb::repository"
  );

  const itemSupplierMap = await db.invItemSupplierMapping.findFirst({
    where: {
      itemId: { in: itemIds },
      supplierId,
      isActive: true,
    },
  });
  logger.info("exiting::getItemSupplierMapByItemAndSupplierFromDb::repository");
  return itemSupplierMap;
}

export async function getItemSupplierMapsByItemIdsAndSupplierIdFromDb(
  itemIds: number[],
  supplierId: number,
  ccId?: number
): Promise<InvItemSupplierMapping[]> {
  logger.info(
    "entering::getItemSupplierMapsByItemIdsAndSupplierIdFromDb::repository"
  );

  const itemSupplierMaps = await db.invItemSupplierMapping.findMany({
    where: {
      itemId: { in: itemIds },
      supplierId,
      ...(ccId ? { ccId } : {}),
      isActive: true,
    },
  });

  logger.info(
    "exiting::getItemSupplierMapsByItemIdsAndSupplierIdFromDb::repository"
  );
  return itemSupplierMaps;
}

export async function getItemSupplierMapFromDb(
  body: GetItemReq
): Promise<InvItemSupplierMapping | null> {
  logger.info("entering::getItemSupplierMapFromDb::repository");
  return await db.invItemSupplierMapping.findFirst({
    where: {
      itemId: body.itemId,
      supplierId: body.supplierId,
      ccId: body.ccId,
      isActive: true,
    },
  });
}
