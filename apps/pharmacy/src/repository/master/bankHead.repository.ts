import { db } from "@repo/db";
import { logger } from "@repo/platform/logging/logger.js";
import { BinaryFlag, CashNBankHead } from "@repo/db/generated/prisma/client";

export const getBankHeadByIdFromDb = async (
  id: number,
): Promise<CashNBankHead | null> => {
  logger.info("entering::getBankHeadByIdFromDb::repository");
  return db.cashNBankHead.findFirst({
    where: {
      id,
      status: BinaryFlag.true,
    },
  });
};
