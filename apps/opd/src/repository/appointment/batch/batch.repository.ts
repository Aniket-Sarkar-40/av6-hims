import { BatchDetailsInput, BatchJobInput } from "@/types/batch/batch.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Prisma, PrismaClient } from "@repo/db/generated/prisma/client";

export type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
type Tx = Prisma.TransactionClient;

export const createBatchJobInDb = async (tx: Tx, inp: BatchJobInput) => {
  logger.info("entering::createBatchJobInDb::repository");
  return tx.opdBatchJob.create({
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
