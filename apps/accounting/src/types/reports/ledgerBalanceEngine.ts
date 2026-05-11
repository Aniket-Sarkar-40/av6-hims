import { DrCr, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "../global.js";

export interface LedgerBalanceEngineInput {
  companyId: number;
  financialYearId: number;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
  ledgerIds?: number[];
  includeZero?: boolean;
}
export type DrCrAmt = {
  dr: number;
  cr: number;
};
export interface LedgerBalanceEngineOutput {
  ledger: IdValue;
  opening: DrCrAmt;
  period: DrCrAmt;
  closing: DrCrAmt;
}

export type SumRow = {
  ledgerId: number;
  drCr: DrCr;
  _sum: { amount: Prisma.Decimal };
};
export type OpeningRow = {
  ledgerId: number;
  drCr: DrCr;
  amount: Prisma.Decimal;
};
