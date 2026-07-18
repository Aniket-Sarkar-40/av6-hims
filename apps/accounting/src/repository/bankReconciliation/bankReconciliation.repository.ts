import { uinServiceFactory } from "@/config/core.config.js";
import { requestStorage } from "@/config/requestContext.js";
import {
  BankStatementExcelBaseInput,
  CreateOrUpdateBankStatementExcelCreateInput,
  CreateOrUpdateBankStatementInput,
  ManualBankReconcileWithBankStatementRow,
} from "@/types/bankReconciliation/bankReconciliation.js";
import { customOmit } from "av6-utils";
import { createBatchJobInDb } from "../batch/batch.repository.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  AccUinShortCode,
  BankMatchConfidence,
  BankMatchType,
  BankReconcileStatus,
  BankStatementSourceType,
  Batch_Type,
  DrCr,
} from "@repo/db/generated/prisma/enums.js";
import { db } from "@repo/db/client";
import { API_TIMEOUT } from "@repo/shared";
import { Prisma } from "@repo/db/generated/prisma/client";

export const createBankStatementExcelInDb = async (
  input: CreateOrUpdateBankStatementExcelCreateInput[]
) => {
  logger.info("entering::createBankStatementExcelInDb::repository");
  const batchUin = await uinServiceFactory.generateUIN(
    AccUinShortCode.BATCH_JOB
  );
  return await db.$transaction(
    async (tx) => {
      const batch = await createBatchJobInDb(tx, {
        totalQty: input.length,
        type: Batch_Type.BANK_STATEMENT_UPLOAD,
        processedQty: 0,
        batchJobNo: batchUin,
      });

      const data = input.map((doc) => ({
        ...doc,
        transactionDate: new Date(doc.transactionDate),
        valueDate: doc.valueDate ? new Date(doc.valueDate) : null,
        batchJobId: batch.id,
      }));

      await tx.bankStatementExcel.createMany({ data });

      return batch;
    },
    { timeout: API_TIMEOUT }
  );
};

export const createBankStatementFromExcelInDb = async (
  tx: Prisma.TransactionClient,
  input: CreateOrUpdateBankStatementInput
) => {
  logger.info("entering::createBankStatementFromExcelInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedData = customOmit<
    CreateOrUpdateBankStatementInput,
    "id" | "statementRows"
  >(input, ["id", "statementRows"]);
  return await tx.bankStatement.create({
    data: {
      ...omittedData.rest,
      createdBy: currentUser,
      statementRows: {
        createMany: {
          data: input.statementRows.map((row) => ({
            ...customOmit(row, ["id"]).rest,
            createdBy: currentUser,
          })),
        },
      },
    },
  });
};

export async function bankStatementExcelBatchJob(params: {
  batchJobId: number;
  baseInput: BankStatementExcelBaseInput;
}) {
  const { batchJobId, baseInput } = params;
  const {
    ledgerId,
    companyId,
    financialYearId,
    statementFrom,
    statementTo,
    remarks,
  } = baseInput;

  let skip = 0;
  let isDone = false;

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const settings = store?.settings;

  const BATCH_SIZE = settings?.excelBatchSize || 100;

  await db.batchJob.update({
    where: { id: batchJobId },
    data: { status: "IN_PROGRESS" },
  });

  while (!isDone) {
    const batchRows = await db.bankStatementExcel.findMany({
      skip,
      take: BATCH_SIZE,
      where: { batchJobId },
      orderBy: { rowNo: "asc" },
    });

    if (batchRows.length === 0) {
      isDone = true;
      break;
    }

    const createdBankStatement = await db.bankStatement.create({
      data: {
        companyId,
        financialYearId,
        statementFrom,
        statementTo,
        remarks,
        ledgerId,
        fileUrl: baseInput.fileUrl,
        createdBy: currentUser,
      },
    });

    for (const row of batchRows) {
      try {
        await db.$transaction(
          async (tx) => {
            const createdBankStatementRow = await tx.bankStatementRow.create({
              data: {
                bankStatementId: createdBankStatement.id,
                sourceType: BankStatementSourceType.IMPORT,
                transactionDate: new Date(row.transactionDate),
                valueDate: row.valueDate ? new Date(row.valueDate) : null,
                transactionId: row.transactionId,
                chequeNo: row.chequeNo,
                description: row.description,
                drCr: row.drCr as DrCr,
                amount: row.transactionAmount,
                voucherNo: row.voucherNo,
                voucherType: row.voucherType,
                ledgerName: row.ledgerName,
                bankName: row.bankName,
                createdBy: currentUser,
              },
            });

            await tx.batchJobDetails.create({
              data: {
                batchId: batchJobId,
                refId: createdBankStatementRow.id,
                refNo: row.transactionId || row.chequeNo || row.voucherNo || "",
                rowTitle:
                  row.description ||
                  `${row.transactionDate} - ${row.transactionId} -${row.drCr} - ${row.transactionAmount}`,
                status: "SUCCESS",
                rowNo: row.rowNo,
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
          `❌ Error processing bank statement row ${
            row.rowNo
          }: ${JSON.stringify(error)}`
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
            rowTitle:
              row.description ||
              `${row.transactionDate} - ${row.transactionId} -${row.drCr} - ${row.transactionAmount}`,
            refNo: row.transactionId || row.chequeNo || row.voucherNo || "",
            status: "FAILED",
            rowNo: row.rowNo,
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

  await db.bankStatementExcel.deleteMany({
    where: { batchJobId },
  });

  if (batchInfo && batchInfo.totalQty === batchInfo.processedQty) {
    await db.batchJob.update({
      where: { id: batchJobId },
      data: { status: "COMPLETED" },
    });
  }
}

export const manualBankReconcileWithBankStatementRowInDb = async (
  input: ManualBankReconcileWithBankStatementRow[]
) => {
  logger.info(
    "entering::manualBankReconcileWithBankStatementRowInDb::repository"
  );
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  return await db.$transaction(async (tx) => {
    for (const row of input) {
      const {
        voucherLineId,
        bankStatementRowId,
        matchedAmount,
        clearedDate,
        remarks,
        bankReferenceNo,
        bankTransactionDate,
      } = row;
      await tx.bankStatementRow.update({
        where: { id: bankStatementRowId },
        data: {
          reconcileStatus: BankReconcileStatus.RECONCILED,
          reconcileRemarks: remarks,
          lastReconciledAt: new Date(),
          lastReconciledBy: currentUser,
        },
      });

      await tx.voucherLine.update({
        where: { id: voucherLineId },
        data: {
          bankReconcileStatus: BankReconcileStatus.RECONCILED,
          bankReferenceNo: bankReferenceNo,
          bankTransactionDate: bankTransactionDate,
          bankClearedDate: clearedDate,
          bankReconcileRemarks: remarks,
          lastReconciledAt: new Date(),
          lastReconciledBy: currentUser,
        },
      });

      await tx.bankReconciliationMatch.create({
        data: {
          voucherLineId: voucherLineId,
          bankStatementRowId: bankStatementRowId,
          matchedAmount: matchedAmount,
          clearedDate: clearedDate,
          matchType: BankMatchType.AUTO,
          matchConfidence: BankMatchConfidence.HIGH,
          remarks: remarks,
          createdBy: currentUser,
        },
      });
    }
  });
};

export const getSummaryStatementRows = async (params: {
  ledgerId: number;
  fromDate: Date;
  toDate: Date;
}) => {
  logger.info("entering::getSummaryStatementRows::repository");
  const { ledgerId, fromDate, toDate } = params;
  return db.bankStatementRow.findMany({
    where: {
      isActive: true,
      transactionDate: { gte: fromDate, lte: toDate },
      bankStatement: {
        ledgerId,
        isActive: true,
      },
    },
    include: {
      bankMatches: {
        where: {
          isActive: true,
        },
      },
    },
  });
};

export const getUnmatchedBankStatementRowsForAutoSuggestion = async (params: {
  ledgerId: number;
  fromDate: Date;
  toDate: Date;
}) => {
  logger.info(
    "entering::getUnmatchedBankStatementRowsForAutoSuggestion::repository"
  );
  const { ledgerId, fromDate, toDate } = params;
  const result = await db.bankStatementRow.findMany({
    where: {
      isActive: true,

      transactionDate: {
        gte: fromDate,
        lte: toDate,
      },

      bankStatement: {
        ledgerId,
        isActive: true,
      },

      bankMatches: {
        none: {
          isActive: true,
        },
      },
    },
    orderBy: [{ transactionDate: "asc" }, { id: "asc" }],
  });
  logger.info(
    "exiting::getUnmatchedBankStatementRowsForAutoSuggestion::repository"
  );
  return result;
};
