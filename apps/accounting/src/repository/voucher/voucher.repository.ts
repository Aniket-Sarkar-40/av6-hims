import { uinServiceFactory } from "@/config/core.config.js";
import { requestStorage } from "@/config/requestContext.js";
import {
  BankLedgerBookRequestInput,
  ManualReconcileRequestInput,
  VoucherLineResponseForBankLedgerBook,
} from "@/types/bankReconciliation/bankReconciliation.js";
import { VoucherLineResponseForLedgerBook } from "@/types/reports/ledgerBook.js";
import {
  CreateOrUpdateVoucherInput,
  VoucherResponse,
  VoucherResponseForDTO,
} from "@/types/voucher/voucher.js";

import { customOmit } from "av6-utils";
import { processBillAllocationsTx } from "./billAllocation.repository.js";
import { createCostCenterAllocations } from "./costCenterAllocation.repository.js";
import { logger } from "@repo/platform/logging/logger.js";
import { db } from "@repo/db";
import {
  AccUinShortCode,
  BankReconcileStatus,
  VoucherStatus,
} from "@repo/db/generated/prisma/enums.js";
import { SumRow } from "@/types/reports/ledgerBalanceEngine.js";
import { Prisma } from "@repo/db/generated/prisma/client";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
type Tx = Prisma.TransactionClient;

export const getVoucherById = async (
  id: number
): Promise<VoucherResponse | null> => {
  logger.info("entering::getVoucherById::repository");
  return db.voucher.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      voucherLines: {
        where: {
          isActive: true,
        },
      },
    },
  });
};

export const createVoucherInDb = async (input: CreateOrUpdateVoucherInput) => {
  logger.info("entering::createVoucherInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedData = customOmit<
    CreateOrUpdateVoucherInput,
    | "id"
    | "voucherLines"
    | "existing"
    | "billAllocations"
    | "costCenterAllocations"
  >(input, [
    "id",
    "voucherLines",
    "existing",
    "billAllocations",
    "costCenterAllocations",
  ]);

  return await db.$transaction(async (tx) => {
    const voucher = await tx.voucher.create({
      data: {
        ...omittedData.rest,
        createdBy: input.createdBy ?? currentUser,
        approvedBy:
          input.status === VoucherStatus.POSTED
            ? input.createdBy ?? currentUser
            : null,
        approvedAt: input.status === VoucherStatus.POSTED ? new Date() : null,
        voucherDate: new Date(input.voucherDate),
        voucherLines: {
          createMany: {
            data: input.voucherLines.map((line) => ({
              ...customOmit(line, ["id"]).rest,
              createdBy: input.createdBy ?? currentUser,
            })),
          },
        },
      },
      include: {
        voucherLines: {
          where: {
            isActive: true,
          },
        },
      },
    });

    if (voucher.status === VoucherStatus.POSTED) {
      const lineNoToId = new Map<number, number>();
      voucher.voucherLines.forEach((l) => lineNoToId.set(l.lineNo, l.id));

      if (input.costCenterAllocations?.length) {
        await createCostCenterAllocations(tx, {
          companyId: voucher.companyId,
          voucherId: voucher.id,
          lineNoToId,
          allocations: input.costCenterAllocations,
          createdBy: currentUser ?? null,
        });
      }

      if (input.billAllocations?.length) {
        const res = await processBillAllocationsTx(tx, {
          companyId: voucher.companyId,
          financialYearId: voucher.financialYearId,
          voucherId: voucher.id,
          voucherLines: voucher.voucherLines.map((l) => ({
            id: l.id,
            lineNo: l.lineNo,
            drCr: l.drCr,
          })),
          allocations: input.billAllocations,
          createdBy: currentUser ?? null,
        });
        if (!res.ok)
          throw new ErrorHandler(400, res.error ?? "Bill allocation failed");
      }
    }
    logger.info("exiting::createVoucherInDb::repository");
    return voucher;
  });
};

export const updateVoucherInDb = async (input: CreateOrUpdateVoucherInput) => {
  logger.info("entering::updateVoucherInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedData = customOmit<
    CreateOrUpdateVoucherInput,
    | "id"
    | "voucherLines"
    | "existing"
    | "billAllocations"
    | "costCenterAllocations"
  >(input, [
    "id",
    "voucherLines",
    "existing",
    "billAllocations",
    "costCenterAllocations",
  ]);

  const incomingIds = new Set(input.voucherLines.map((l) => l.id));

  const voucherLinesToCreate = input.voucherLines.filter((l) => !l.id);
  const voucherLinesToUpdate = input.voucherLines.filter((l) => l.id);
  const voucherLinesToDelete = input.existing.voucherLines
    .filter((l) => !incomingIds.has(l.id))
    .map((l) => l.id);

  return await db.$transaction(async (tx) => {
    const voucher = await tx.voucher.update({
      where: { id: input.id },
      data: {
        ...omittedData.rest,
        updatedBy: currentUser,
        voucherDate: new Date(input.voucherDate),
        approvedBy:
          input.status === VoucherStatus.POSTED
            ? input.createdBy ?? currentUser
            : null,
        approvedAt: input.status === VoucherStatus.POSTED ? new Date() : null,
        voucherLines: {
          updateMany: {
            where: {
              id: {
                in: voucherLinesToDelete,
              },
            },
            data: {
              isActive: false,
              deletedBy: currentUser,
              deletedAt: new Date(),
            },
          },
          createMany: {
            data: voucherLinesToCreate.map((line) => ({
              ...customOmit(line, ["id"]).rest,
              createdBy: currentUser,
            })),
          },
          update: voucherLinesToUpdate.map((line) => ({
            where: { id: line.id },
            data: {
              ...customOmit(line, ["id"]).rest,
              updatedBy: currentUser,
            },
          })),
        },
      },
      include: {
        voucherLines: {
          where: {
            isActive: true,
          },
        },
      },
    });

    const lineNoToId = new Map<number, number>();
    voucher.voucherLines.forEach((l) => lineNoToId.set(l.lineNo, l.id));

    await tx.costCenterAllocation.updateMany({
      where: { voucherId: voucher.id, isActive: true },
      data: {
        isActive: false,
        deletedBy: currentUser,
        deletedAt: new Date(),
      },
    });

    await tx.billAllocation.updateMany({
      where: { voucherId: voucher.id, isActive: true },
      data: {
        isActive: false,
        deletedBy: currentUser,
        deletedAt: new Date(),
      },
    });

    if (voucher.status === VoucherStatus.POSTED) {
      if (input.costCenterAllocations?.length) {
        await createCostCenterAllocations(tx, {
          companyId: voucher.companyId,
          voucherId: voucher.id,
          lineNoToId,
          allocations: input.costCenterAllocations,
          createdBy: currentUser ?? null,
        });
      }

      if (input.billAllocations?.length) {
        await processBillAllocationsTx(tx, {
          companyId: voucher.companyId,
          financialYearId: voucher.financialYearId,
          voucherId: voucher.id,
          voucherLines: voucher.voucherLines.map((l) => ({
            id: l.id,
            lineNo: l.lineNo,
            drCr: l.drCr,
          })),
          allocations: input.billAllocations,
          createdBy: currentUser ?? null,
        });
      }
    }
    logger.info("exiting::updateVoucherInDb::repository");
    return voucher;
  });
};

export const deleteVoucherFromDb = async (id: number) => {
  logger.info("entering::deleteVoucherFromDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.$transaction(async (tx) => {
    await tx.voucher.update({
      where: { id },
      data: {
        isActive: false,
        deletedBy: currentUser,
        deletedAt: new Date(),
        voucherLines: {
          updateMany: {
            where: { isActive: true },
            data: {
              isActive: false,
              deletedBy: currentUser,
              deletedAt: new Date(),
            },
          },
        },
      },
    });

    // delete cost center allocations
    await tx.costCenterAllocation.updateMany({
      where: { voucherId: id, isActive: true },
      data: {
        isActive: false,
        deletedBy: currentUser,
        deletedAt: new Date(),
      },
    });

    // delete bill allocations
    await tx.billAllocation.updateMany({
      where: { voucherId: id, isActive: true },
      data: {
        isActive: false,
        deletedBy: currentUser,
        deletedAt: new Date(),
      },
    });

    // delete bill documents
    await tx.billDocument.updateMany({
      where: { sourceVoucherId: id, isActive: true },
      data: {
        isActive: false,
        deletedBy: currentUser,
        deletedAt: new Date(),
      },
    });
  });
};

export const cancelVoucherInDb = async (id: number) => {
  logger.info("entering::cancelVoucherInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.voucher.update({
    where: {
      id,
      isActive: true,
    },
    data: {
      status: VoucherStatus.CANCELLED,
      updatedBy: currentUser,
    },
  });
};
export const getVoucherLineSumsBeforeDate = async (params: {
  companyId: number;
  financialYearId: number;
  fromDate: Date;
  ccId?: number;
  ledgerIds?: number[];
}) => {
  logger.info("entering::getVoucherLineSumsBeforeDate::repository");
  const { companyId, financialYearId, fromDate, ccId, ledgerIds } = params;

  const rows = (await db.voucherLine.groupBy({
    by: ["ledgerId", "drCr"],
    where: {
      isActive: true,
      ledger: {
        isActive: true,
      },
      ...(ledgerIds?.length ? { ledgerId: { in: ledgerIds } } : {}),
      voucher: {
        isActive: true,
        companyId,
        financialYearId,
        status: VoucherStatus.POSTED,
        ...(ccId ? { ccId } : {}),
        voucherDate: { lt: fromDate },
      },
    },
    _sum: { amount: true },
  })) as SumRow[] | null;

  logger.info("exiting::getVoucherLineSumsBeforeDate::repository");
  return rows;
};

export const getVoucherLineSumsInRange = async (params: {
  companyId: number;
  financialYearId: number;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
  ledgerIds?: number[];
}) => {
  logger.info("entering::getVoucherLineSumsInRange::repository");
  const { companyId, financialYearId, fromDate, toDate, ccId, ledgerIds } =
    params;

  const rows = (await db.voucherLine.groupBy({
    by: ["ledgerId", "drCr"],
    where: {
      isActive: true,
      ledger: {
        isActive: true,
      },
      ...(ledgerIds?.length ? { ledgerId: { in: ledgerIds } } : {}),
      voucher: {
        isActive: true,
        companyId,
        financialYearId,
        status: VoucherStatus.POSTED,
        ...(ccId ? { ccId } : {}),
        voucherDate: { gte: fromDate, lte: toDate },
      },
    },
    _sum: { amount: true },
  })) as SumRow[] | null;

  logger.info("exiting::getVoucherLineSumsInRange::repository");
  return rows;
};

export const getLedgerBookLines = async (params: {
  companyId: number;
  financialYearId: number;
  ledgerId: number;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
}): Promise<VoucherLineResponseForLedgerBook[]> => {
  logger.info("entering::getLedgerBookLines::repository");
  const { companyId, financialYearId, ledgerId, fromDate, toDate, ccId } =
    params;

  return db.voucherLine.findMany({
    where: {
      ledgerId,
      isActive: true,
      voucher: {
        isActive: true,
        companyId,
        financialYearId,
        status: VoucherStatus.POSTED,
        ...(ccId ? { ccId } : {}),
        voucherDate: { gte: fromDate, lte: toDate },
      },
    },

    include: {
      voucher: true,
    },
    orderBy: [
      { lineNo: "asc" },
      { voucher: { voucherDate: "asc" } },
      { voucherId: "asc" },
    ],
  });
};

export const createVoucherFromExcelInDb = async (
  tx: Tx,
  input: CreateOrUpdateVoucherInput
) => {
  logger.info("entering::createVoucherInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const voucherNo = await uinServiceFactory.generateUIN(
    AccUinShortCode.VOUCHER
  );

  const omittedData = customOmit<
    CreateOrUpdateVoucherInput,
    | "id"
    | "voucherLines"
    | "existing"
    | "billAllocations"
    | "costCenterAllocations"
  >(input, [
    "id",
    "voucherLines",
    "existing",
    "billAllocations",
    "costCenterAllocations",
  ]);
  return await tx.voucher.create({
    data: {
      ...omittedData.rest,
      voucherNo: voucherNo,
      createdBy: input.createdBy ?? currentUser,
      voucherDate: new Date(input.voucherDate),
      voucherLines: {
        createMany: {
          data: input.voucherLines.map((line) => ({
            ...customOmit(line, ["id"]).rest,
            createdBy: input.createdBy ?? currentUser,
          })),
        },
      },
    },
  });
};

export const getBankLedgerBookLines = async (
  input: BankLedgerBookRequestInput
): Promise<VoucherLineResponseForBankLedgerBook[]> => {
  logger.info("entering::getBankLedgerBookLines::repository");
  const {
    companyId,
    financialYearId,
    ledgerId,
    fromDate,
    toDate,
    ccId,
    status,
  } = input;

  return db.voucherLine.findMany({
    where: {
      ledgerId,
      isActive: true,
      bankReconcileStatus: status,
      voucher: {
        isActive: true,
        companyId,
        financialYearId,
        status: VoucherStatus.POSTED,
        ...(ccId ? { ccId } : {}),
        voucherDate: { gte: fromDate, lte: toDate },
      },
    },

    include: {
      voucher: true,
      bankMatches: {
        where: {
          isActive: true,
        },
        include: {
          bankStatementRow: true,
        },
      },
    },
    orderBy: [
      { lineNo: "asc" },
      { voucher: { voucherDate: "asc" } },
      { voucherId: "asc" },
    ],
  });
};

export const manualReconcileVoucherLines = async (
  input: ManualReconcileRequestInput
) => {
  logger.info("entering::manualReconcileVoucherLines::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const { ledgerId, rows } = input;

  // Instead of updateMany (which only allows a single data object), perform individual updates in a transaction
  const updatedLines = await db.$transaction(
    rows.map((r) =>
      db.voucherLine.update({
        where: {
          id: r.voucherLineId,
          ledgerId,
          isActive: true,
        },
        data: {
          bankReconcileStatus: BankReconcileStatus.RECONCILED,
          bankClearedDate: new Date(r.bankClearedDate),
          bankReferenceNo: r.bankReferenceNo,
          bankReconcileRemarks: r.remarks,
          lastReconciledAt: new Date(),
          lastReconciledBy: currentUser,
        },
      })
    )
  );

  return updatedLines;
};

export const getSummaryVoucherRows = async (params: {
  ledgerId: number;
  fromDate: Date;
  toDate: Date;
}) => {
  logger.info("entering::getSummaryVoucherRows::repository");
  const { ledgerId, fromDate, toDate } = params;
  return db.voucherLine.findMany({
    where: {
      ledgerId,
      isActive: true,
      voucher: {
        isActive: true,
        status: "POSTED",
        voucherDate: { gte: fromDate, lte: toDate },
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
export const getCashFlowVouchersFromDb = async (input: {
  companyId: number;
  financialYearId: number;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
}) => {
  logger.info("entering::getCashFlowVouchersFromDb::repository");

  const { companyId, financialYearId, fromDate, toDate, ccId } = input;

  const result = await db.voucher.findMany({
    where: {
      companyId,
      financialYearId,
      ...(ccId ? { ccId } : {}),
      voucherDate: {
        gte: fromDate,
        lte: toDate,
      },
      isActive: true,
      status: VoucherStatus.POSTED,
    },
    include: {
      voucherLines: {
        where: {
          isActive: true,
        },
        orderBy: {
          lineNo: "asc",
        },
      },
    },
    orderBy: [{ voucherDate: "asc" }, { id: "asc" }],
  });

  logger.info("exiting::getCashFlowVouchersFromDb::repository");
  return result;
};

export const getUnmatchedVoucherLinesForBankAutoSuggestion = async (params: {
  ledgerId: number;
  fromDate: Date;
  toDate: Date;
}) => {
  logger.info(
    "entering::getUnmatchedVoucherLinesForBankAutoSuggestion::repository"
  );
  const { ledgerId, fromDate, toDate } = params;
  const result = await db.voucherLine.findMany({
    where: {
      ledgerId,
      isActive: true,
      voucher: {
        isActive: true,
        status: "POSTED",
        voucherDate: {
          gte: fromDate,
          lte: toDate,
        },
      },

      bankMatches: {
        none: {
          isActive: true,
        },
      },
    },
    include: {
      voucher: true,
    },
    orderBy: [{ voucher: { voucherDate: "asc" } }, { id: "asc" }],
  });
  logger.info(
    "exiting::getUnmatchedVoucherLinesForBankAutoSuggestion::repository"
  );
  return result;
};

export const getVoucherDetailsForInvoice = async (
  voucherId: number
): Promise<VoucherResponseForDTO | null> => {
  logger.info("entering::getVoucherDetailsForInvoice::repository");
  return db.voucher.findFirst({
    where: {
      id: voucherId,
      isActive: true,
    },
    include: {
      company: true,
      financialYear: true,
      voucherLines: {
        where: {
          isActive: true,
        },
      },
      costCenterAllocations: {
        where: {
          isActive: true,
        },
      },
      billAllocations: {
        where: {
          isActive: true,
        },
      },
    },
  });
};
