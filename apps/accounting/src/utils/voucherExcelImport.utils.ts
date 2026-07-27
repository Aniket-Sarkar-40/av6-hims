import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { getCompanyFinancialYearByCompanyIdAndIsCurrentFromDb } from "@/repository/master/companyFinancialYear.repository.js";
import { createLedgerInDb } from "@/repository/master/ledger.repository.js";
import { commonGetService } from "@/services/common.service.js";
import {
  LedgerColumnMeta,
  OtherLedger,
  VoucherEntryExcelRow,
} from "@/types/batch/batch.js";
import { CreateOrUpdateLedgerInput } from "@/types/master/ledger.js";
import { preparedVoucherInputFromExcel } from "@/types/voucher/voucher.js";
import {
  buildVoucher,
  VoucherLineSeed,
} from "@/utils/externalVoucherPost.utils.js";
import {
  BankTransactionType,
  DrCr,
  Ledger,
  VoucherEntryExcel,
} from "@repo/db/generated/prisma/client";
import { addToCache } from "@repo/platform/cache/redis.utils.js";
import { DEFAULT_COMPANY_ID } from "@repo/shared";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";
import dayjs, { Dayjs } from "dayjs";

export function getLedgerColumnMeta(
  row: VoucherEntryExcelRow,
): LedgerColumnMeta[] {
  const keys = Object.keys(row);
  const ledgerIndexes = new Set<number>();

  for (const key of keys) {
    const match = key.match(/^Ledger (\d+)$/);
    if (match) {
      ledgerIndexes.add(Number(match[1]));
    }
  }

  return Array.from(ledgerIndexes)
    .sort((a, b) => a - b)
    .map((index) => ({
      index,
      ledgerKey: `Ledger ${index}`,
      groupKey: `Ledger ${index} Group`,
      amountKey: `Ledger ${index} Amount`,
      drCrKey: `Ledger ${index} Dr/Cr`,
      transactionType: row[
        `Ledger ${index} Transaction Type`
      ] as BankTransactionType,
      instrumentNo: row[`Ledger ${index} Instrument No`],
      instrumentDate: row[`Ledger ${index} Instrument Date`],
    }));
}

export function validateVoucherExcelHeaders(row: VoucherEntryExcelRow) {
  const requiredHeaders = [
    "Voucher Date",
    "Voucher Type",
    "Narration",
    "Status",
  ];

  for (const header of requiredHeaders) {
    if (!(header in row)) {
      throw new ErrorHandler(400, `Missing required column: ${header}`);
    }
  }

  const ledgerMeta = getLedgerColumnMeta(row);

  if (ledgerMeta.length === 0) {
    throw new ErrorHandler(
      400,
      "No ledger columns found (Ledger 1, Ledger 2, ...)",
    );
  }

  for (const col of ledgerMeta) {
    if (!(col.amountKey in row)) {
      throw new ErrorHandler(400, `Missing column: ${col.amountKey}`);
    }
  }
}

export function extractOtherLedgersWithMeta(
  row: VoucherEntryExcelRow,
  meta: LedgerColumnMeta[],
): OtherLedger[] {
  const ledgers: OtherLedger[] = [];

  for (const col of meta) {
    const ledgerName = row[col.ledgerKey];

    if (!ledgerName || ledgerName.toString().trim() === "") {
      break;
    }
    let instrumentDate: Dayjs | undefined;
    if (col.instrumentDate) {
      instrumentDate = dayjs(col.instrumentDate, "DD-MM-YYYY", true); // strict parsing
      if (!instrumentDate.isValid()) {
        throw new Error(
          `Invalid Instrument Date at row ${col.index}: ${col.instrumentDate}`,
        );
      }
    }

    ledgers.push({
      ledgerName: ledgerName.toString().trim(),
      ledgerGroup: row[col.groupKey]?.toString().trim(),
      amount: Number(row[col.amountKey] || 0),
      drCr:
        col.drCrKey && row[col.drCrKey] !== undefined
          ? row[col.drCrKey]?.toString().trim().toUpperCase()
          : undefined,
      transactionType: col.transactionType,
      instrumentNo: col.instrumentNo,
      instrumentDate: instrumentDate
        ? instrumentDate.format("YYYY-MM-DD")
        : undefined,
    });
  }

  return ledgers;
}

/**Constant for the voucher type group names for party ledger */
const VOUCHER_TYPE_GROUP_NAMES_FOR_PARTY_LEDGER = {
  Purchase: "Sundry Creditors",
  Sales: "Sundry Debtors",
};
const ledgerCacheKey = getRedisKey("LEDGER", "all");

export async function buildVoucherInputFromExcel(params: {
  item: VoucherEntryExcel;
  voucherTypeId: number;
  ccId: number;
}): Promise<preparedVoucherInputFromExcel> {
  const { item, voucherTypeId, ccId } = params;
  const otherLedgers = item.otherLedgers as unknown as OtherLedger[];

  if (!otherLedgers || otherLedgers.length === 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("NOT_FOUND", "Ledger Entries"),
    );
  }

  const isCacheable = await checkIsCacheable(SHORT_CODE.LEDGER);
  const companyId = DEFAULT_COMPANY_ID;

  const financialYear =
    await getCompanyFinancialYearByCompanyIdAndIsCurrentFromDb(companyId);
  if (!financialYear) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("NOT_FOUND", "Financial Year"),
    );
  }
  if (financialYear.isLocked) {
    throw new ErrorHandler(
      400,
      "Financial Year is locked, cannot create voucher",
    );
  }
  if (financialYear.isClosed) {
    throw new ErrorHandler(
      400,
      "Financial Year is closed, cannot create voucher",
    );
  }
  const lines: VoucherLineSeed[] = [];

  const allLedgers = (await commonGetService.getAllElements<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  })) as Ledger[];

  const ledgers = allLedgers.filter((l) => l.companyId === companyId);

  const allGroups = await commonGetService.getAllElements<"Group">({
    cacheCode: "GROUP",
    canNullReturnable: true,
    modelName: "Group",
    shortCode: "GROUP",
    useActiveFlag: true,
  });
  const groups = allGroups.filter((g) => g.companyId === companyId);

  /**-------------------------------- Party Ledger -------------------------------- */
  if (item.partyLedger) {
    const totalAmount = otherLedgers.reduce((sum, l) => sum + l.amount, 0);

    if (totalAmount <= 0) {
      throw new ErrorHandler(
        400,
        `Invalid total amount: ${totalAmount} for row: ${item.rowNo}`,
      );
    }

    const partyLedger = ledgers.find((l) => l.name === item.partyLedger);
    let partyLedgerId = 0;
    if (!partyLedger) {
      const groupName =
        item.partyLedgerGroup ??
        VOUCHER_TYPE_GROUP_NAMES_FOR_PARTY_LEDGER[
          item.voucherType as keyof typeof VOUCHER_TYPE_GROUP_NAMES_FOR_PARTY_LEDGER
        ];
      const group = groups.find((g) => g.name === groupName);
      if (!group) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "NOT_FOUND",
            `Group for party ledger: ${item.partyLedger}`,
          ),
        );
      }
      const partyLedgerGroupId = group.id;
      const partyLedgerCreateInput: CreateOrUpdateLedgerInput = {
        companyId: companyId,
        groupId: partyLedgerGroupId,
        name: item.partyLedger,
      };
      const partyLedger = await createLedgerInDb(partyLedgerCreateInput);
      if (isCacheable && partyLedger) {
        await addToCache(ledgerCacheKey, partyLedger.id, partyLedger);
      }
      partyLedgerId = partyLedger.id;
    } else {
      partyLedgerId = partyLedger.id;
    }

    lines.push({
      ledgerId: partyLedgerId,
      drCr: resolveDrCr({
        voucherType: item.voucherType.trim().toUpperCase(),
        ledgerType: "PARTY",
      }),
      amount: totalAmount,
    });
  }
  /**-------------------------------- Other Ledgers -------------------------------- */
  for (const l of otherLedgers) {
    // if (l.amount <= 0) {
    //   throw new ErrorHandler(400, `Invalid amount for ledger: ${l.ledgerName}`);
    // }

    const ledger = ledgers.find((d) => d.name === l.ledgerName);
    let ledgerId = 0;
    if (!ledger) {
      const group = groups.find((g) => g.name === l.ledgerGroup);
      if (!group) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "NOT_FOUND",
            `Group for ledger: ${l.ledgerName}`,
          ),
        );
      }
      let isBankAccount = false;
      let isCashAccount = false;
      if (group.name.trim().toUpperCase() === "BANK ACCOUNTS") {
        isBankAccount = true;
      }
      if (group.name.trim().toUpperCase() === "CASH-in-HAND") {
        isCashAccount = true;
      }
      const ledgerGroupId = group.id;
      const ledgerCreateInput: CreateOrUpdateLedgerInput = {
        companyId: companyId,
        groupId: ledgerGroupId,
        name: l.ledgerName,
        isBankAccount,
        isCashAccount,
      };
      const createdLedger = await createLedgerInDb(ledgerCreateInput);
      if (isCacheable && createdLedger) {
        await addToCache(ledgerCacheKey, createdLedger.id, createdLedger);
      }
      ledgerId = createdLedger.id;
    } else {
      ledgerId = ledger.id;
    }
    const allowedVoucherTypes = ["JOURNAL", "CONTRA"];

    if (allowedVoucherTypes.includes(item.voucherType.trim().toUpperCase())) {
      if (otherLedgers.length !== 2) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("ARRAY_LENGTH", "Ledger Entries", "2"),
        );
      }
    }
    const drCr = allowedVoucherTypes.includes(
      item.voucherType.trim().toUpperCase(),
    )
      ? (l.drCr as DrCr)
      : resolveDrCr({
          voucherType: item.voucherType.trim().toUpperCase(),
          ledgerType: "OTHER",
        });

    lines.push({
      ledgerId: ledgerId,
      drCr: l.amount < 0 ? (drCr === DrCr.DR ? DrCr.CR : DrCr.DR) : drCr,
      amount: Math.abs(l.amount),
      transactionType:
        l.transactionType && l.transactionType.trim() !== ""
          ? (l.transactionType.trim() as BankTransactionType)
          : undefined,
      instrumentNo:
        l.instrumentNo && l.instrumentNo.trim() !== ""
          ? l.instrumentNo.trim()
          : undefined,
      instrumentDate: l.instrumentDate ? new Date(l.instrumentDate) : undefined,
    });
  }
  const common = {
    ccId,
    companyId,
    financialYearId: financialYear.id,
    voucherDate: item.voucherDate,
    refNo: item.refNo ?? null,
    refType: item.refType ?? null,
    subRefType: item.subRefType ?? null,
    narration: item.narration ?? null,
    voucherTypeId: voucherTypeId,
    status: item.status,
  };
  const voucher = buildVoucher({
    ...common,
    voucherLines: lines,
  });

  return voucher;
}

type ResolveDrCrParams = {
  voucherType: string;
  ledgerType: "PARTY" | "OTHER";
};

export function resolveDrCr(params: ResolveDrCrParams): DrCr {
  const { voucherType, ledgerType } = params;

  switch (voucherType) {
    case "PURCHASE":
      return ledgerType === "PARTY" ? DrCr.CR : DrCr.DR;
    case "SALES":
      return ledgerType === "PARTY" ? DrCr.DR : DrCr.CR;
    case "PAYMENT":
      return ledgerType === "PARTY" ? DrCr.DR : DrCr.CR;
    case "RECEIPT":
      return ledgerType === "PARTY" ? DrCr.CR : DrCr.DR;
    case "BANK PAYMENT":
      return ledgerType === "PARTY" ? DrCr.DR : DrCr.CR;
    case "CASH PAYMENT":
      return ledgerType === "PARTY" ? DrCr.DR : DrCr.CR;
    default:
      throw new ErrorHandler(400, `Invalid voucher type: ${voucherType}`);
  }
}
