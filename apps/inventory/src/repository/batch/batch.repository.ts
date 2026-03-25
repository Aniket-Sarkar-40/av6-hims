import {
  InvBatchJobDetailsInput,
  InvBatchJobInput,
} from "@/types/batch/batch.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Prisma } from "@repo/db/generated/prisma/client";

type Tx = Prisma.TransactionClient;
export const createBatchJobInDb = async (tx: Tx, inp: InvBatchJobInput) => {
  logger.info("entering::createBatchJobInDb::repository");
  return tx.invBatchJob.create({
    data: inp,
  });
};

export const createBatchDetailsInDb = async (
  tx: Tx,
  inp: InvBatchJobDetailsInput,
) => {
  logger.info("entering::createBatchDetailsInDb::repository");
  return tx.invBatchJobDetails.create({
    data: inp,
  });
};
