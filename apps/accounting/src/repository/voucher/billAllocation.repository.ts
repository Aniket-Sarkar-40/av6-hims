import { PostVoucherBillAllocationInput } from "@/types/voucher/voucher.js";
import { adjustBillDocumentAgainstRef } from "./billDocument.repository.js";
import {
  AllocationType,
  BillStatus,
  BillType,
  DrCr,
  Prisma,
} from "@repo/db/generated/prisma/client";

type Tx = Prisma.TransactionClient;

export const processBillAllocationsTx = async (
  tx: Tx,
  params: {
    companyId: number;
    financialYearId: number;
    voucherId: number;
    voucherLines: { id: number; lineNo: number; drCr: DrCr }[];
    allocations: PostVoucherBillAllocationInput[];
    createdBy: number | null;
  },
): Promise<{ ok: boolean; error?: string }> => {
  const {
    companyId,
    financialYearId,
    voucherId,
    voucherLines,
    allocations,
    createdBy,
  } = params;

  const byLineNo = new Map<number, { id: number; drCr: DrCr }>();
  voucherLines.forEach((l) =>
    byLineNo.set(l.lineNo, { id: l.id, drCr: l.drCr }),
  );

  for (const alloc of allocations) {
    const line = byLineNo.get(alloc.lineNo);
    if (!line)
      return {
        ok: false,
        error: "INVALID_ASSOCIATION: Bill Allocation -> Voucher Line",
      };

    if (alloc.allocationType === AllocationType.NEW_REF) {
      const bill = await tx.billDocument.create({
        data: {
          companyId,
          financialYearId,
          partyLedgerId: alloc.partyLedgerId,
          billType:
            line.drCr === DrCr.DR ? BillType.RECEIVABLE : BillType.PAYABLE,
          refNo: alloc.refNo as string,
          refDate: alloc.refDate as Date,
          dueDate: alloc.dueDate ?? null,
          amount: alloc.amount,
          adjustedAmount: 0,
          status: BillStatus.OPEN,
          sourceVoucherId: voucherId,
          createdBy: createdBy ?? undefined,
        },
      });

      await tx.billAllocation.create({
        data: {
          companyId,
          financialYearId,
          voucherId,
          voucherLineId: line.id,
          partyLedgerId: alloc.partyLedgerId,
          allocationType: AllocationType.NEW_REF,
          billDocumentId: bill.id,
          refNo: alloc.refNo,
          refDate: alloc.refDate ?? null,
          dueDate: alloc.dueDate ?? null,
          drCr: alloc.drCr,
          amount: alloc.amount,
          createdBy: createdBy ?? undefined,
        },
      });

      continue;
    }

    if (alloc.allocationType === AllocationType.AGAINST_REF) {
      const adj = await adjustBillDocumentAgainstRef(tx, {
        billDocumentId: alloc.billDocumentId as number,
        companyId,
        financialYearId,
        partyLedgerId: alloc.partyLedgerId,
        amountToAdjust: Number(alloc.amount),
        updatedBy: createdBy,
      });

      if (!adj.ok)
        return { ok: false, error: adj.reason ?? "Bill adjust failed" };

      await tx.billAllocation.create({
        data: {
          companyId,
          financialYearId,
          voucherId,
          voucherLineId: line.id,
          partyLedgerId: alloc.partyLedgerId,
          allocationType: AllocationType.AGAINST_REF,
          billDocumentId: alloc.billDocumentId,
          drCr: alloc.drCr,
          amount: alloc.amount,
          createdBy: createdBy ?? undefined,
        },
      });

      continue;
    }

    // ON_ACCOUNT
    await tx.billAllocation.create({
      data: {
        companyId,
        financialYearId,
        voucherId,
        voucherLineId: line.id,
        partyLedgerId: alloc.partyLedgerId,
        allocationType: AllocationType.ON_ACCOUNT,
        drCr: alloc.drCr,
        amount: alloc.amount,
        createdBy: createdBy ?? undefined,
      },
    });
  }

  return { ok: true };
};
