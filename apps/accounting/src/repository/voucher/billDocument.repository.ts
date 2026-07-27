import { db } from "@repo/db/client";
import { BillStatus, Prisma } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";

type Tx = Prisma.TransactionClient;

export const getBillDocumentsByIds = async (ids: number[]) => {
  logger.info("entering::getBillDocumentsByIds::repository");
  return db.billDocument.findMany({
    where: {
      id: { in: ids },
      isActive: true,
    },
  });
};

export const adjustBillDocumentAgainstRef = async (
  tx: Tx,
  params: {
    billDocumentId: number;
    companyId: number;
    financialYearId: number;
    partyLedgerId: number;
    amountToAdjust: number;
    updatedBy: number | null;
  },
): Promise<{ ok: boolean; reason?: string }> => {
  const {
    billDocumentId,
    companyId,
    financialYearId,
    partyLedgerId,
    amountToAdjust,
    updatedBy,
  } = params;

  const bill = await tx.billDocument.findFirst({
    where: {
      id: billDocumentId,
      companyId,
      financialYearId,
      partyLedgerId,
      isActive: true,
      status: { in: [BillStatus.OPEN, BillStatus.PARTIAL] },
    },
    select: { id: true, amount: true, adjustedAmount: true, status: true },
  });

  if (!bill) return { ok: false, reason: "Bill document not found/open" };

  const remaining = Number(bill.amount) - Number(bill.adjustedAmount);
  if (amountToAdjust > remaining)
    return { ok: false, reason: "Over-adjustment" };

  const newAdjusted = Number(bill.adjustedAmount) + amountToAdjust;
  const newStatus =
    newAdjusted >= Number(bill.amount) ? BillStatus.CLOSED : BillStatus.PARTIAL;

  // Optimistic guard: update only if adjustedAmount is still what we read
  const updated = await tx.billDocument.updateMany({
    where: {
      id: bill.id,
      companyId,
      financialYearId,
      partyLedgerId,
      isActive: true,
      status: { in: [BillStatus.OPEN, BillStatus.PARTIAL] },
      adjustedAmount: bill.adjustedAmount, // guard
    },
    data: {
      adjustedAmount: new Prisma.Decimal(newAdjusted),
      status: newStatus,
      updatedBy: updatedBy ?? undefined,
      updatedAt: new Date(),
    },
  });

  if (updated.count !== 1)
    return { ok: false, reason: "Concurrent update, retry" };
  return { ok: true };
};
