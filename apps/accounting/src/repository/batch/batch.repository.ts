import { uinServiceFactory } from "@/config/core.config.js";
import {
  CreateOrUpdateBatchJobDetailsInput,
  CreateOrUpdateBatchJobInput,
  CreateOrUpdateVoucherEntryExcelInput,
} from "@/types/batch/batch.js";
import { buildVoucherInputFromExcel } from "@/utils/voucherExcelImport.utils.js";
import { createVoucherFromExcelInDb } from "../voucher/voucher.repository.js";
import { CreateOrUpdateVoucherInput } from "@/types/voucher/voucher.js";
import { requestStorage } from "@/config/requestContext.js";
import {
  AccUinShortCode,
  Batch_Type,
  Prisma,
  PrismaClient,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { db } from "@repo/db";
import { API_TIMEOUT } from "@repo/shared";
import { createOrUpdateVoucherServiceValidation } from "@/validations/service/voucher/voucher.service.validation.js";

export type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
type Tx = Prisma.TransactionClient;

export const createBatchJobInDb = async (
  tx: Tx,
  inp: CreateOrUpdateBatchJobInput,
) => {
  logger.info("entering::createBatchJobInDb::repository");
  return tx.batchJob.create({
    data: inp,
  });
};

export const createBatchDetailsInDb = async (
  tx: Tx,
  inp: CreateOrUpdateBatchJobDetailsInput,
) => {
  logger.info("entering::createBatchDetailsInDb::repository");
  return tx.batchJobDetails.create({
    data: inp,
  });
};

export const createVoucherExcelInDb = async (
  input: CreateOrUpdateVoucherEntryExcelInput[],
) => {
  logger.info("entering::createVoucherExcelInDb::repository");
  const batchUin = await uinServiceFactory.generateUIN(
    AccUinShortCode.BATCH_JOB,
  );
  // input.voucherNo = await uinServiceFactory.generateUIN(UinShortCode.VOUCHER);
  return await db.$transaction(
    async (tx) => {
      const batch = await createBatchJobInDb(tx, {
        totalQty: input.length,
        type: Batch_Type.VOUCHER_ENTRY,
        processedQty: 0,
        batchJobNo: batchUin,
      });

      const data = input.map((doc) => ({
        ...doc,
        voucherDate: new Date(doc.voucherDate),
        batchJobId: batch.id,
      }));

      await tx.voucherEntryExcel.createMany({ data });

      return batch;
    },
    { timeout: API_TIMEOUT },
  );
};

export async function voucherExcelBatchJob(params: {
  batchJobId: number;
  voucherTypeId: number;
  ccId: number;
}) {
  const { batchJobId, voucherTypeId, ccId } = params;
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
    const batch = await db.voucherEntryExcel.findMany({
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
            const voucherInput = await buildVoucherInputFromExcel({
              item,
              voucherTypeId,
              ccId,
            });
            await createOrUpdateVoucherServiceValidation({
              input: voucherInput as CreateOrUpdateVoucherInput,
            });
            const createdVoucher = await createVoucherFromExcelInDb(
              tx,
              voucherInput as CreateOrUpdateVoucherInput,
            );

            await tx.batchJobDetails.create({
              data: {
                batchId: batchJobId,
                refId: createdVoucher.id,
                refNo: createdVoucher.voucherNo,
                rowTitle: createdVoucher.narration,
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
        console.error(`❌ Error processing voucher row ${item.rowNo}:`, error);

        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "Unknown error";

        // Log failure
        await db.batchJobDetails.create({
          data: {
            batchId: batchJobId,
            rowTitle: item.partyLedger,
            refNo: item.refNo,
            status: "FAILED",
            rowNo: item.rowNo,
            errorMsg: `${item.partyLedger} ---> ${errorMessage}`,
          },
        });

        // Update failure count
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

  // Final status update
  const batchInfo = await db.batchJob.findUnique({
    where: { id: batchJobId },
  });

  // Cleanup staging table
  await db.voucherEntryExcel.deleteMany({
    where: { batchJobId },
  });

  if (batchInfo && batchInfo.totalQty === batchInfo.processedQty) {
    await db.batchJob.update({
      where: { id: batchJobId },
      data: { status: "COMPLETED" },
    });
  }
}
