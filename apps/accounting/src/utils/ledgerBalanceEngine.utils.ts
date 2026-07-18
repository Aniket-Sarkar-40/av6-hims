// ledger-balance.utils.ts
import { IdValue } from "@/types/global.js";
import type { DrCrAmt, SumRow } from "@/types/reports/ledgerBalanceEngine.js";
import { DrCr, Prisma } from "@repo/db/generated/prisma/client";
export type LedgerBalanceRowNum = {
  ledger: IdValue | null;
  opening: DrCrAmt;
  period: DrCrAmt;
  closing: DrCrAmt;
};
const D0 = new Prisma.Decimal(0);

export const decToNum = (d: Prisma.Decimal, scale = 5) =>
  Number(d.toFixed(scale));

export const signedFromDrCr = (drCr: DrCr, amount: number) => {
  return drCr === DrCr.DR ? amount : -amount;
};

export const drCrFromSignedNum = (signed: Prisma.Decimal): DrCrAmt => {
  if (signed.greaterThanOrEqualTo(0)) return { dr: decToNum(signed), cr: 0 };
  return { dr: 0, cr: decToNum(signed.abs()) };
};

export const buildDrCrSumMap = (rows: SumRow[]) => {
  const map = new Map<number, { dr: number; cr: number }>();
  for (const r of rows) {
    const amt = Number(r._sum.amount);
    const prev = map.get(r.ledgerId) ?? { dr: 0, cr: 0 };
    if (r.drCr === DrCr.DR) prev.dr = prev.dr + amt;
    else prev.cr = prev.cr + amt;
    map.set(r.ledgerId, prev);
  }
  return map;
};

export const toPeriodNums = (dr: Prisma.Decimal, cr: Prisma.Decimal) => ({
  dr: decToNum(dr),
  cr: decToNum(cr),
});

export const isAllZero = (row: LedgerBalanceRowNum) =>
  row.opening.dr === 0 &&
  row.opening.cr === 0 &&
  row.period.dr === 0 &&
  row.period.cr === 0 &&
  row.closing.dr === 0 &&
  row.closing.cr === 0;

export const D_ZERO = D0;

export const almostEqual = (a: number, b: number) => Math.abs(a - b) < 0.00001;

export const addSigned = (signed: number, dr: number, cr: number) =>
  signed + dr - cr;

export const toDrCr = (signed: number) => {
  if (signed > 0) {
    return {
      dr: Math.abs(signed),
      cr: 0,
    };
  } else {
    return {
      dr: 0,
      cr: Math.abs(signed),
    };
  }
};
export const addDrCr = (
  a: { dr: number; cr: number },
  b: { dr: number; cr: number },
) => {
  return { dr: a.dr + b.dr, cr: a.cr + b.cr };
};

export const zero = () => ({ dr: 0, cr: 0 });

export const netIncome = (amt: DrCrAmt) => amt.cr - amt.dr;
export const netExpense = (amt: DrCrAmt) => amt.dr - amt.cr;

// ---------------------------------------------------

export const isZero = (a: DrCrAmt) => a.dr === 0 && a.cr === 0;
export const netAsset = (a: DrCrAmt) => a.dr - a.cr;
export const netLiability = (a: DrCrAmt) => a.cr - a.dr;

/**opening balance differance in opening and closing balance */

export type DifferenceType = "OPENING" | "PERIOD" | "CLOSING";

type DifferenceResult<T> = {
  items: T[];
  totals: {
    dr: number;
    cr: number;
  };
};

export function addDifferenceNodeAdvanced<T>(params: {
  items: T[];
  drTotal: number;
  crTotal: number;
  type: DifferenceType;
  createNode: (diff: number, type: DifferenceType) => T;
  tolerance?: number;
}): DifferenceResult<T> {
  const {
    items,
    drTotal,
    crTotal,
    type,
    createNode,
    tolerance = 0.0001,
  } = params;

  let newDr = drTotal;
  let newCr = crTotal;

  const diff = drTotal - crTotal;

  // Already balanced
  if (Math.abs(diff) < tolerance) {
    return {
      items,
      totals: { dr: newDr, cr: newCr },
    };
  }

  // Create node
  const node = createNode(diff, type);
  items.push(node);

  // Adjust totals
  if (diff > 0) {
    newCr += Math.abs(diff);
  } else {
    newDr += Math.abs(diff);
  }

  return {
    items,
    totals: {
      dr: newDr,
      cr: newCr,
    },
  };
}

export function getDifferenceLabel(type: DifferenceType): string {
  switch (type) {
    case "OPENING":
      return "Difference in Opening Balance";
    case "PERIOD":
      return "Difference in Period Balance";
    case "CLOSING":
      return "Difference in Closing Balance";
    default:
      return "Difference";
  }
}
