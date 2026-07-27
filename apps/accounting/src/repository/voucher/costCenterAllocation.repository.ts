import { CreateOrUpdateCostCenterAllocationInput } from "@/types/voucher/costCenterAllocation.js";
import { PostVoucherCostCenterAllocationInput } from "@/types/voucher/voucher.js";
import { Prisma } from "@repo/db/generated/prisma/client";

type Tx = Prisma.TransactionClient;

export const createCostCenterAllocations = async (
  tx: Tx,
  params: {
    companyId: number;
    voucherId: number;
    lineNoToId: Map<number, number>;
    allocations: PostVoucherCostCenterAllocationInput[];
    createdBy: number | null;
  },
) => {
  const { companyId, voucherId, lineNoToId, allocations, createdBy } = params;
  const data = allocations
    .map((alloc) => {
      const voucherLineId = lineNoToId.get(alloc.lineNo);
      if (!voucherLineId) return null; // ignore silently (should not happen)
      return {
        companyId,
        voucherId,
        voucherLineId,
        costCenterId: alloc.costCenterId,
        drCr: alloc.drCr,
        amount: alloc.amount,
        createdBy: createdBy ?? undefined,
      };
    })
    .filter(Boolean) as CreateOrUpdateCostCenterAllocationInput[];

  if (!data.length) return { count: 0 };

  return tx.costCenterAllocation.createMany({ data });
};
