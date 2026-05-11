import { checkIsCacheable, getRedisKey } from "@/config/cache.config.js";
import { DEFAULT_COMPANY_ID } from "@/config/index.js";
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
  DrCr,
  Ledger,
  VoucherEntryExcel,
} from "@repo/db/generated/prisma/client";
import { addToCache } from "@repo/platform/cache/redis.utils.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";

// export function extractOtherLedgers(row: VoucherEntryExcelRow): OtherLedger[] {
//   const ledgers: OtherLedger[] = [];

//   let index = 1;

//   while (true) {
//     const ledgerKey = `Ledger ${index}`;
//     const groupKey = `Ledger ${index} Group`;
//     const amountKey = `Ledger ${index} Amount`;

//     if (!row[ledgerKey]) break;

//     ledgers.push({
//       ledgerName: row[ledgerKey],
//       ledgerGroup: row[groupKey],
//       amount: Number(row[amountKey] || 0),
//     });

//     index++;
//   }

//   return ledgers;
// }

export function getLedgerColumnMeta(
  row: VoucherEntryExcelRow
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
      "No ledger columns found (Ledger 1, Ledger 2, ...)"
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
  meta: LedgerColumnMeta[]
): OtherLedger[] {
  const ledgers: OtherLedger[] = [];

  for (const col of meta) {
    const ledgerName = row[col.ledgerKey];

    if (!ledgerName || ledgerName.toString().trim() === "") {
      break;
    }

    ledgers.push({
      ledgerName: ledgerName.toString().trim(),
      ledgerGroup: row[col.groupKey]?.toString().trim(),
      amount: Number(row[col.amountKey] || 0),
      drCr:
        col.drCrKey && row[col.drCrKey] !== undefined
          ? row[col.drCrKey]?.toString().trim().toUpperCase()
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
  const otherLedgers = item.otherLedgers as OtherLedger[];

  if (!otherLedgers || otherLedgers.length === 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("NOT_FOUND", "Ledger Entries")
    );
  }

  const isCacheable = await checkIsCacheable(SHORT_CODE.LEDGER);
  const companyId = DEFAULT_COMPANY_ID;

  const financialYear =
    await getCompanyFinancialYearByCompanyIdAndIsCurrentFromDb(companyId);
  if (!financialYear) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("NOT_FOUND", "Financial Year")
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
        `Invalid total amount: ${totalAmount} for row: ${item.rowNo}`
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
            `Group for party ledger: ${item.partyLedger}`
          )
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
    if (l.amount <= 0) {
      throw new ErrorHandler(400, `Invalid amount for ledger: ${l.ledgerName}`);
    }

    const ledger = ledgers.find((d) => d.name === l.ledgerName);
    let ledgerId = 0;
    if (!ledger) {
      const group = groups.find((g) => g.name === l.ledgerGroup);
      if (!group) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("NOT_FOUND", `Group for ledger: ${l.ledgerName}`)
        );
      }
      const ledgerGroupId = group.id;
      const ledgerCreateInput: CreateOrUpdateLedgerInput = {
        companyId: companyId,
        groupId: ledgerGroupId,
        name: l.ledgerName,
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
          generateErrorMessage("ARRAY_LENGTH", "Ledger Entries", "2")
        );
      }
    }
    const drCr = allowedVoucherTypes.includes(
      item.voucherType.trim().toUpperCase()
    )
      ? (l.drCr as DrCr)
      : resolveDrCr({
          voucherType: item.voucherType.trim().toUpperCase(),
          ledgerType: "OTHER",
        });

    lines.push({
      ledgerId: ledgerId,
      drCr: drCr,
      amount: l.amount,
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
    default:
      throw new ErrorHandler(400, `Invalid voucher type: ${voucherType}`);
  }
}
