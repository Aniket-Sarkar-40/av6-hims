import { IdValue } from "../global.js";
import { DrCrAmt, LedgerBalanceEngineInput } from "./ledgerBalanceEngine.js";

export type TrialBalanceRequestInput = LedgerBalanceEngineInput;

export type TrialBalanceRow = {
  ledger: IdValue | null;
  group: IdValue | null;
  parentGroup: IdValue | null;
  opening: DrCrAmt;
  period: DrCrAmt;
  closing: DrCrAmt;
};

export type TrialBalanceResponse = {
  rows: TrialBalanceRow[];

  totals: {
    opening: DrCrAmt;
    period: DrCrAmt;
    closing: DrCrAmt;
  };

  isBalanced: {
    opening: boolean;
    period: boolean;
    closing: boolean;
  };
};
