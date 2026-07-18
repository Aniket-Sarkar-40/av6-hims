import { db } from "@repo/db/client";
import { CashNBankHead } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";

export const getCashAndBankHeadByIdFromDb = async (
  id: number
): Promise<CashNBankHead | null> => {
  logger.info("entering::getCashAndBankHeadByIdFromDb::repository");
  const cashAndBankHead = await db.cashNBankHead.findFirst({
    where: {
      id,
      status: "true",
    },
  });
  logger.info("exiting::getCashAndBankHeadByIdFromDb::repository");
  return cashAndBankHead;
};
