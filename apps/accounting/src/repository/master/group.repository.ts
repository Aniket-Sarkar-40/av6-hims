import { uinServiceFactory } from "@/config/core.config.js";
import { initializeCache } from "@/config/redisClient.js";
import { requestStorage } from "@/config/requestContext.js";
import { buildGroupInputFromExcel } from "@/mapper/master/group.mapper.js";
import { createBatchJobInDb } from "@/repository/batch/batch.repository.js";
import {
  CreateOrUpdateGroupExcelInput,
  CreateOrUpdateGroupInput,
} from "@/types/master/group.js";
import { db } from "@repo/db";
import { Prisma } from "@repo/db/generated/prisma/client";
import {
  AccUinShortCode,
  Batch_Type,
} from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";
import { API_TIMEOUT } from "@repo/shared";
import { customOmit } from "av6-utils";

type Tx = Prisma.TransactionClient;

export const deleteGroupFromDb = async (id: number) => {
  logger.info("entering::deleteGroupFromDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.group.update({
    where: { id },
    data: {
      isActive: false,
      deletedBy: currentUser,
      deletedAt: new Date(),
    },
  });
};

export const createGroupFromExcelInDb = async (
  tx: Tx,
  input: CreateOrUpdateGroupInput,
) => {
  logger.info("entering::createGroupFromExcelInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const omittedData = customOmit<CreateOrUpdateGroupInput, "id">(input, ["id"]);
  return tx.group.create({
    data: {
      ...omittedData.rest,
      createdBy: currentUser,
    },
  });
};

export const createGroupExcelInDb = async (
  input: CreateOrUpdateGroupExcelInput[],
) => {
  logger.info("entering::createGroupExcelInDb::repository");
  const batchUin = await uinServiceFactory.generateUIN(
    AccUinShortCode.BATCH_JOB,
  );
  return await db.$transaction(
    async (tx) => {
      const batch = await createBatchJobInDb(tx, {
        totalQty: input.length,
        type: Batch_Type.GROUP_IMPORT,
        processedQty: 0,
        batchJobNo: batchUin,
      });

      const data = input.map((doc) => ({
        ...doc,
        batchJobId: batch.id,
      }));

      await tx.groupExcel.createMany({ data });

      return batch;
    },
    { timeout: API_TIMEOUT },
  );
};

export async function groupExcelBatchJob(params: {
  batchJobId: number;
  companyId: number;
}) {
  const { batchJobId, companyId } = params;
  let skip = 0;
  let isDone = false;

  const store = requestStorage.getStore();
  const settings = store?.settings;
  const BATCH_SIZE = settings?.excelBatchSize || 100;

  await db.batchJob.update({
    where: { id: batchJobId },
    data: { status: "IN_PROGRESS" },
  });

  while (!isDone) {
    const batchRows = await db.groupExcel.findMany({
      skip,
      take: BATCH_SIZE,
      where: { batchJobId },
      orderBy: { rowNo: "asc" },
    });

    if (batchRows.length === 0) {
      isDone = true;
      break;
    }

    for (const item of batchRows) {
      try {
        await db.$transaction(
          async (tx) => {
            const groupInput = await buildGroupInputFromExcel({
              item,
              companyId,
            });
            // await createOrUpdateGroupServiceValidation(groupInput);
            const group = await createGroupFromExcelInDb(tx, groupInput);

            await tx.batchJobDetails.create({
              data: {
                batchId: batchJobId,
                refId: group.id,
                refNo: group.name,
                rowTitle: group.name,
                status: "SUCCESS",
                rowNo: item.rowNo,
              },
            });

            await tx.batchJob.update({
              where: { id: batchJobId },
              data: {
                processedQty: { increment: 1 },
                successCount: { increment: 1 },
                status: "IN_PROGRESS",
              },
            });
          },
          { timeout: API_TIMEOUT },
        );
      } catch (error) {
        logger.error(
          `❌ Error processing group row ${item.rowNo}: ${JSON.stringify(
            error,
          )}`,
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
            rowTitle: item.name,
            status: "FAILED",
            rowNo: item.rowNo,
            errorMsg: errorMessage,
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

  await db.groupExcel.deleteMany({
    where: { batchJobId },
  });

  if (batchInfo && batchInfo.totalQty === batchInfo.processedQty) {
    await db.batchJob.update({
      where: { id: batchJobId },
      data: { status: "COMPLETED" },
    });
  }
  await initializeCache();
}
