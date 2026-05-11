import { db } from "@repo/db";
import { logger } from "@repo/platform/logging/logger.js";

export const getOpeningBalancesByLedgerIds = async (params: {
  companyId: number;
  financialYearId: number;
  ledgerIds?: number[];
}) => {
  logger.info("entering::getOpeningBalancesByLedgerIds::repository");
  const { companyId, financialYearId, ledgerIds } = params;
  return await db.ledgerOpeningBalance.findMany({
    where: {
      companyId,
      financialYearId,
      isActive: true,
      ledger: {
        isActive: true,
      },
      ...(ledgerIds?.length ? { id: { in: ledgerIds } } : {}),
    },
  });
};
