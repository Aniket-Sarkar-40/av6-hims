import { initializeCache } from "@/config/redisClient.js";
import { requestStorage } from "@/config/requestContext.js";
import { buildLedgerInputFromExcel } from "@/mapper/master/ledger.mapper.js";
import {
  CreateOrUpdateLedger,
  CreateOrUpdateLedgerInput,
} from "@/types/master/ledger.js";
import { db } from "@repo/db";
import {
  AccUinShortCode,
  Batch_Type,
  Ledger,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { API_TIMEOUT } from "@repo/shared";
import { customOmit } from "av6-utils";

import { stateService } from "@apps/core/services/master/state.service.js";
import { createBatchJobInDb } from "@/repository/batch/batch.repository.js";
import { uinServiceFactory } from "@/config/core.config.js";

type Tx = Prisma.TransactionClient;

export const createLedgerInDb = async (input: CreateOrUpdateLedgerInput) => {
  logger.info("entering::createLedgerInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const { ledgerOpeningBalance, ...ledgerData } = input;
  return db.$transaction(async (tx) => {
    return await tx.ledger.create({
      data: {
        ...ledgerData,
        createdBy: currentUser,
        ledgerOpeningBalances: ledgerOpeningBalance
          ? {
              create: {
                ...ledgerOpeningBalance,
                asOnDate: new Date(ledgerOpeningBalance.asOnDate),
                companyId: ledgerData.companyId,
                createdBy: currentUser,
              },
            }
          : undefined,
      },
    });
  });
};

export const updateLedgerInDb = async (input: CreateOrUpdateLedgerInput) => {
  logger.info("entering::updateLedgerInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const { ledgerOpeningBalance, id, ...ledgerData } = input;

  return db.$transaction(async (tx) => {
    return await tx.ledger.update({
      where: { id },
      data: {
        ...ledgerData,
        updatedBy: currentUser,
        ledgerOpeningBalances: ledgerOpeningBalance
          ? ledgerOpeningBalance.id
            ? {
                update: {
                  where: { id: ledgerOpeningBalance.id },
                  data: {
                    ...customOmit(ledgerOpeningBalance, ["id"]).rest,
                    asOnDate: new Date(ledgerOpeningBalance.asOnDate),
                    companyId: ledgerData.companyId,
                    updatedBy: currentUser,
                  },
                },
              }
            : {
                create: {
                  ...ledgerOpeningBalance,
                  asOnDate: new Date(ledgerOpeningBalance.asOnDate),
                  companyId: ledgerData.companyId,
                  createdBy: currentUser,
                },
              }
          : undefined,
      },
    });
  });
};

export const patchLedgerInDb = async (
  input: Pick<
    CreateOrUpdateLedgerInput,
    "id" | "currencyId" | "creditPeriodInDays"
  >
) => {
  logger.info("entering::patchLedgerInDb::repository");
  const { id, currencyId, creditPeriodInDays } = input;
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.ledger.update({
    where: { id },
    data: {
      currencyId: currencyId,
      creditPeriodInDays: creditPeriodInDays,
      updatedBy: currentUser,
    },
  });
};

export const deleteLedgerFromDb = async (id: number) => {
  logger.info("entering::deleteLedgerFromDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.ledger.update({
    where: { id },
    data: {
      isActive: false,
      deletedBy: currentUser,
      deletedAt: new Date(),
      ledgerOpeningBalances: {
        updateMany: {
          where: {
            ledgerId: id,
          },
          data: {
            isActive: false,
            deletedBy: currentUser,
            deletedAt: new Date(),
          },
        },
      },
    },
  });
};

export const getLedgersByCompanyIdAndLedgerIds = async (params: {
  companyId: number;
  ledgerIds?: number[];
}): Promise<Ledger[]> => {
  logger.info("entering::getLedgersByCompanyIdAndLedgerIds::repository");
  const { companyId, ledgerIds } = params;

  return await db.ledger.findMany({
    where: {
      companyId,
      isActive: true,
      ...(ledgerIds?.length ? { id: { in: ledgerIds } } : {}),
    },
  });
};

export const getAllLedgersByCompanyId = async (
  companyId: number
): Promise<Ledger[]> => {
  logger.info("entering::getAllLedgersByCompanyId::repository");
  return await db.ledger.findMany({
    where: {
      companyId,
      isActive: true,
    },
  });
};

export const getLedgersByGroupId = async (
  groupId: number
): Promise<Ledger[]> => {
  logger.info("entering::getLedgersByGroupId::repository");
  return await db.ledger.findMany({
    where: {
      groupId,
      isActive: true,
    },
  });
};

export const createLedgerFromExcelInDb = async (
  tx: Tx,
  input: CreateOrUpdateLedger
) => {
  logger.info("entering::createLedgerFromExcelInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  return tx.ledger.create({
    data: {
      ...input,
      createdBy: currentUser,
    },
  });
};

export const createLedgerExcelInDb = async (
  input: CreateOrUpdateLedgerExcelInput[]
) => {
  logger.info("entering::createLedgerExcelInDb::repository");
  const batchUin = await uinServiceFactory.generateUIN(
    AccUinShortCode.BATCH_JOB
  );
  return await db.$transaction(
    async (tx) => {
      const batch = await createBatchJobInDb(tx, {
        totalQty: input.length,
        type: Batch_Type.LEDGER_IMPORT,
        processedQty: 0,
        batchJobNo: batchUin,
      });

      const data = input.map((doc) => ({
        ...doc,
        batchJobId: batch.id,
      }));

      await tx.ledgerExcel.createMany({ data });

      return batch;
    },
    { timeout: API_TIMEOUT }
  );
};

export async function ledgerExcelBatchJob(params: {
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

  const states = await stateService.getAllStates();
  const stateMap = new Map<string, number>(
    states.map((state) => [state.name, state.id])
  );
  while (!isDone) {
    const batchRows = await db.ledgerExcel.findMany({
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
            const ledgerInput = await buildLedgerInputFromExcel({
              item,
              companyId,
              stateMap,
            });
            // await createOrUpdateLedgerServiceValidation(ledgerInput);
            const ledger = await createLedgerFromExcelInDb(tx, ledgerInput);

            await tx.batchJobDetails.create({
              data: {
                batchId: batchJobId,
                refId: ledger.id,
                refNo: ledger.name,
                rowTitle: ledger.name,
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
          { timeout: API_TIMEOUT }
        );
      } catch (error) {
        logger.error(
          `❌ Error processing ledger row ${item.rowNo}: ${JSON.stringify(
            error
          )}`
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

  await db.ledgerExcel.deleteMany({
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
