import { LedgerBalanceEngineInput } from "./ledgerBalanceEngine.js";
import { IdValue } from "../global.js";
import { DrCr } from "@repo/db/generated/prisma/enums.js";

export type LedgerForexReportInput = LedgerBalanceEngineInput;

export type ForexDrCrAmt = {
  amount: number;
  drCr: DrCr | null;
};

export interface LedgerForexGainLossRow {
  ledger: IdValue | null;
  group: IdValue | null;
  currency: IdValue | null;
  foreignClosingAmount: ForexDrCrAmt;
  transactedBaseAmount: ForexDrCrAmt;
  currentRate: number;
  currentBaseAmount: ForexDrCrAmt;
  ledgerRevaluationAmount: ForexDrCrAmt;
  forexGainLossAmount: ForexDrCrAmt;

  isGain: boolean;
  isLoss: boolean;
}

export interface LedgerForexGainLossEngineResult {
  asOfDate: string;
  baseCurrency: IdValue | null;
  rows: LedgerForexGainLossRow[];
  totals: {
    transactedBaseAmount: ForexDrCrAmt;
    currentBaseAmount: ForexDrCrAmt;
    forexRevaluationAmount: ForexDrCrAmt;
    forexGainLossAmount: ForexDrCrAmt;
  };
}

// Group-wise (Tally style) forex gain/loss statement.
// When groupId is provided that group is the root; otherwise every top-level
// group is treated as a root.
export type ForexGainLossStatementInput = {
  companyId: number;
  financialYearId: number;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
  groupId?: number;
  includeZero?: boolean;
};

export interface ForexGainLossTotals {
  transactedBaseAmount: ForexDrCrAmt;
  currentBaseAmount: ForexDrCrAmt;
  forexGainLossAmount: ForexDrCrAmt;
}

export interface ForexGainLossNode {
  group: IdValue | null;
  parent: IdValue | null;
  transactedBaseAmount: ForexDrCrAmt;
  currentBaseAmount: ForexDrCrAmt;
  forexGainLossAmount: ForexDrCrAmt;
  children: ForexGainLossNode[];
  ledger: LedgerForexGainLossRow[];
}

export interface ForexGainLossStatementResult {
  asOfDate: string;
  baseCurrency: IdValue | null;
  roots: ForexGainLossNode[];
  totals: ForexGainLossTotals;
}
