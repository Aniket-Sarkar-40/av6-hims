import { requestStorage } from "@/config/requestContext.js";
import {
  BankLedgerBookRequestInput,
  ManualReconcileRequestInput,
  VoucherLineResponseForBankLedgerBook,
} from "@/types/bankReconciliation/bankReconciliation.js";
import { SumRow } from "@/types/reports/ledgerBalanceEngine.js";
import { VoucherLineResponseForLedgerBook } from "@/types/reports/ledgerBook.js";
import {
  CreateOrUpdateVoucherInput,
  CreateVoucherAuditInput,
  VoucherResponse,
  VoucherResponseForDTO,
} from "@/types/voucher/voucher.js";
import { customOmit } from "av6-utils";
import { processBillAllocationsTx } from "./billAllocation.repository.js";
import { createCostCenterAllocations } from "./costCenterAllocation.repository.js";
import {
  BankReconcileStatus,
  BankTransactionType,
  Prisma,
  Voucher,
  VoucherStatus,
  VoucherTypeNature,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { db } from "@repo/db/client";
type Tx = Prisma.TransactionClient;

export const getVoucherById = async (
  id: number,
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
    | "usedChequeMasterId"
    | "lineNo"
  >(input, [
    "id",
    "voucherLines",
    "existing",
    "billAllocations",
    "costCenterAllocations",
    "usedChequeMasterId",
    "lineNo",
  ]);

  return await db.$transaction(async (tx) => {
    const voucher = await tx.voucher.create({
      data: {
        ...omittedData.rest,
        createdBy: input.createdBy ?? currentUser,
        approvedBy:
          input.status === VoucherStatus.POSTED
            ? (input.createdBy ?? currentUser)
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
    for (const voucherLine of voucher.voucherLines) {
      if (
        voucherLine.transactionType === BankTransactionType.CHEQUE &&
        input.usedChequeMasterId
      ) {
        await tx.usedChequeNumber.create({
          data: {
            chequeMasterId: input.usedChequeMasterId,
            chequeNo: voucherLine.instrumentNo
              ? Number(voucherLine.instrumentNo)
              : 0,
            isUsed: true,
            voucherLineId: voucherLine.id,
            createdBy: currentUser,
          },
        });
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
    | "usedChequeMasterId"
    | "lineNo"
  >(input, [
    "id",
    "voucherLines",
    "existing",
    "billAllocations",
    "costCenterAllocations",
    "usedChequeMasterId",
    "lineNo",
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
            ? (input.createdBy ?? currentUser)
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

    /**
     * Audit voucher table
     */
    const omittedExistingDataForAudit = customOmit(input.existing, [
      "voucherLines",
      "id",
    ]);

    await createVoucherAuditInDb(tx, {
      ...omittedExistingDataForAudit.rest,
      voucherId: omittedExistingDataForAudit.omitted.id,
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
    for (const voucherLine of voucher.voucherLines) {
      const usedChequeNumber = await tx.usedChequeNumber.findMany({
        where: {
          voucherLineId: voucherLine.id,
          isActive: true,
          isUsed: true,
        },
      });

      if (usedChequeNumber.length > 0) {
        await tx.usedChequeNumber.updateMany({
          where: {
            id: { in: usedChequeNumber.map((ucn) => ucn.id) },
          },
          data: {
            isActive: false,
            isUsed: false,
            deletedBy: currentUser,
            deletedAt: new Date(),
            updatedBy: currentUser,
          },
        });
      }
      if (
        voucherLine.transactionType === BankTransactionType.CHEQUE &&
        input.usedChequeMasterId
      ) {
        await tx.usedChequeNumber.create({
          data: {
            chequeMasterId: input.usedChequeMasterId,
            voucherLineId: voucherLine.id,
            chequeNo: voucherLine.instrumentNo
              ? Number(voucherLine.instrumentNo)
              : 0,
            isUsed: true,
            createdBy: currentUser,
          },
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
  input: CreateOrUpdateVoucherInput,
) => {
  logger.info("entering::createVoucherFromExcelInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedData = customOmit<
    CreateOrUpdateVoucherInput,
    | "id"
    | "voucherLines"
    | "existing"
    | "billAllocations"
    | "costCenterAllocations"
    | "lineNo"
  >(input, [
    "id",
    "voucherLines",
    "existing",
    "billAllocations",
    "costCenterAllocations",
    "lineNo",
  ]);
  return await tx.voucher.create({
    data: {
      ...omittedData.rest,
      createdBy: currentUser,
      voucherDate: new Date(input.voucherDate),
      approvedBy: input.status === VoucherStatus.POSTED ? currentUser : null,
      approvedAt: input.status === VoucherStatus.POSTED ? new Date() : null,
      voucherLines: {
        createMany: {
          data: input.voucherLines.map((line) => ({
            ...customOmit(line, ["id"]).rest,
            createdBy: currentUser,
            instrumentDate: line.instrumentDate
              ? new Date(line.instrumentDate)
              : undefined,
          })),
        },
      },
    },
  });
};

export const getBankLedgerBookLines = async (
  input: BankLedgerBookRequestInput,
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
  input: ManualReconcileRequestInput,
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
          lastReconciledAt: new Date(),
          lastReconciledBy: currentUser,
        },
      }),
    ),
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
    "entering::getUnmatchedVoucherLinesForBankAutoSuggestion::repository",
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
    "exiting::getUnmatchedVoucherLinesForBankAutoSuggestion::repository",
  );
  return result;
};

export const getVoucherDetailsForInvoice = async (
  voucherId: number,
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

export const createVoucherFromMultiVoucherInDb = async (
  tx: Tx,
  input: CreateOrUpdateVoucherInput,
) => {
  logger.info("entering::createVoucherFromMultiVoucherInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedData = customOmit<
    CreateOrUpdateVoucherInput,
    | "id"
    | "voucherLines"
    | "existing"
    | "billAllocations"
    | "costCenterAllocations"
    | "lineNo"
    | "usedChequeMasterId"
  >(input, [
    "id",
    "voucherLines",
    "existing",
    "billAllocations",
    "costCenterAllocations",
    "lineNo",
    "usedChequeMasterId",
  ]);
  const createdVoucher = await tx.voucher.create({
    data: {
      ...omittedData.rest,
      voucherNo: input.voucherNo,
      createdBy: currentUser,
      voucherDate: new Date(input.voucherDate),
      approvedBy: input.status === VoucherStatus.POSTED ? currentUser : null,
      approvedAt: input.status === VoucherStatus.POSTED ? new Date() : null,
      voucherLines: {
        createMany: {
          data: input.voucherLines.map((line) => ({
            ...customOmit(line, ["id"]).rest,
            createdBy: currentUser,
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
  for (const voucherLine of createdVoucher.voucherLines) {
    if (
      voucherLine.transactionType === BankTransactionType.CHEQUE &&
      input.usedChequeMasterId
    ) {
      await tx.usedChequeNumber.create({
        data: {
          chequeMasterId: input.usedChequeMasterId,
          chequeNo: voucherLine.instrumentNo
            ? Number(voucherLine.instrumentNo)
            : 0,
          isUsed: true,
          voucherLineId: voucherLine.id,
          createdBy: currentUser,
        },
      });
    }
  }
  return createdVoucher;
};

export const updateVoucherFromPostedMultiVoucherInDb = async (
  tx: Tx,
  input: CreateOrUpdateVoucherInput,
) => {
  logger.info("entering::updateVoucherFromPostedMultiVoucherInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedData = customOmit<
    CreateOrUpdateVoucherInput,
    | "id"
    | "voucherLines"
    | "existing"
    | "billAllocations"
    | "costCenterAllocations"
    | "usedChequeMasterId"
    | "lineNo"
  >(input, [
    "id",
    "voucherLines",
    "existing",
    "billAllocations",
    "costCenterAllocations",
    "usedChequeMasterId",
    "lineNo",
  ]);

  return await db.$transaction(async (tx) => {
    const voucher = await tx.voucher.update({
      where: { id: input.id },
      data: {
        ...omittedData.rest,
        updatedBy: currentUser,
        voucherDate: new Date(input.voucherDate),
        voucherLines: {
          updateMany: {
            where: {
              voucherId: input.id,
            },
            data: {
              isActive: false,
              deletedBy: currentUser,
              deletedAt: new Date(),
            },
          },
          createMany: {
            data: input.voucherLines.map((line) => ({
              ...customOmit(line, ["id"]).rest,
              createdBy: currentUser,
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

    /**
     * Audit voucher table
     */
    const omittedExistingDataForAudit = customOmit(input.existing, [
      "voucherLines",
      "id",
    ]);

    await createVoucherAuditInDb(tx, {
      ...omittedExistingDataForAudit.rest,
      voucherId: omittedExistingDataForAudit.omitted.id,
    });

    for (const voucherLine of voucher.voucherLines) {
      const usedChequeNumber = await tx.usedChequeNumber.findMany({
        where: {
          voucherLineId: voucherLine.id,
          isActive: true,
          isUsed: true,
        },
      });

      if (usedChequeNumber.length > 0) {
        await tx.usedChequeNumber.updateMany({
          where: {
            id: { in: usedChequeNumber.map((ucn) => ucn.id) },
          },
          data: {
            isActive: false,
            isUsed: false,
            deletedBy: currentUser,
            deletedAt: new Date(),
            updatedBy: currentUser,
          },
        });
      }
      if (
        voucherLine.transactionType === BankTransactionType.CHEQUE &&
        input.usedChequeMasterId
      ) {
        await tx.usedChequeNumber.create({
          data: {
            chequeMasterId: input.usedChequeMasterId,
            voucherLineId: voucherLine.id,
            chequeNo: voucherLine.instrumentNo
              ? Number(voucherLine.instrumentNo)
              : 0,
            isUsed: true,
            createdBy: currentUser,
          },
        });
      }
    }
    logger.info("exiting::updateVoucherFromPostedMultiVoucherInDb::repository");
    return voucher;
  });
};

export const createVoucherAuditInDb = async (
  tx: Tx,
  input: CreateVoucherAuditInput,
) => {
  logger.info("entering::createVoucherAuditInDb::repository");

  await tx.voucherAudit.create({
    data: {
      ...input,
    },
  });
  logger.info("exiting::createVoucherAuditInDb::repository");
};

export const getLastSellingRateByCurrencyId = async (params: {
  companyId: number;
  currencyId: number;
  financialYearId: number;
}): Promise<Voucher | null> => {
  logger.info("entering::getLastSellingRateByCurrencyId::repository");

  const { companyId, currencyId, financialYearId } = params;

  const result = await db.voucher.findFirst({
    where: {
      companyId,
      currencyId,
      financialYearId,
      status: VoucherStatus.POSTED,
      isActive: true,
      voucherType: {
        nature: VoucherTypeNature.SALES,
      },
    },
    orderBy: [{ id: "desc" }, { voucherDate: "desc" }],
  });

  logger.info("exiting::getLastSellingRateByCurrencyId::repository");

  return result;
};

export const getLastPurchaseRateByCurrencyId = async (params: {
  companyId: number;
  currencyId: number;
  financialYearId: number;
}): Promise<Voucher | null> => {
  logger.info("entering::getLastPurchaseRateByCurrencyId::repository");

  const { companyId, currencyId, financialYearId } = params;

  const result = await db.voucher.findFirst({
    where: {
      companyId,
      currencyId,
      financialYearId,
      status: VoucherStatus.POSTED,
      isActive: true,
      voucherType: {
        nature: VoucherTypeNature.PURCHASE,
      },
    },
    orderBy: [{ id: "desc" }, { voucherDate: "desc" }],
  });

  logger.info("exiting::getLastPurchaseRateByCurrencyId::repository");

  return result;
};
export const getVoucherForexSumsBeforeDate = async (input: {
  companyId: number;
  financialYearId: number;
  fromDate: Date;
  ccId?: number;
  ledgerIds: number[];
}) => {
  logger.info("entering::getVoucherForexSumsBeforeDate::repository");
  const { companyId, financialYearId, fromDate, ccId, ledgerIds } = input;

  if (!ledgerIds.length) return [];

  const result = await db.voucherLine.groupBy({
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
    _sum: {
      amount: true,
      currencyAmount: true,
    },
  });
  logger.info("exiting::getVoucherForexSumsBeforeDate::repository");
  return result;
};

export const getVoucherForexSumsInRange = async (params: {
  companyId: number;
  financialYearId: number;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
  ledgerIds?: number[];
}) => {
  logger.info("entering::getVoucherForexSumsInRange::repository");
  const { companyId, financialYearId, fromDate, toDate, ccId, ledgerIds } =
    params;

  const rows = await db.voucherLine.groupBy({
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
    _sum: {
      amount: true,
      currencyAmount: true,
    },
  });

  logger.info("exiting::getVoucherForexSumsInRange::repository");
  return rows;
};
