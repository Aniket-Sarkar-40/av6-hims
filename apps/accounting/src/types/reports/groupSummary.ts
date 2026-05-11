import { LedgerBalanceRowNum } from "@/utils/ledgerBalanceEngine.utils.js";
import { IdValue } from "../global.js";
import { DrCrAmt } from "./ledgerBalanceEngine.js";
import type { AgeingBucketInput } from "./report.js";

export type GroupSummaryNode = {
  group: IdValue | null;
  parent: IdValue | null;

  opening: DrCrAmt;
  period: DrCrAmt;
  closing: DrCrAmt;

  children: GroupSummaryNode[];
  ledger: LedgerBalanceRowNum[];
};

export type GroupSummaryTotals = {
  openingDr: number;
  openingCr: number;
  periodDr: number;
  periodCr: number;
  closingDr: number;
  closingCr: number;
};

export type GroupSummaryTreeResponse = {
  roots: GroupSummaryNode[];
  totals: GroupSummaryTotals;
  ageing?: AgeingSummaryResponse;
};

export type GroupSummaryRequestInput = {
  companyId: number;
  financialYearId: number;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
  groupId?: number;
  groupIds?: number[];
  includeZero?: boolean;
};

export type AgeingBucketAmount = {
  from: number;
  to: number;
  amount: number;
};

export type AgeingSummaryRow = {
  ledger: IdValue;
  pending: number;
  bucketAmounts: AgeingBucketAmount[];
};

export type AgeingSummaryResponse = {
  asOnDate: Date;
  bucketDefinitions: AgeingBucketInput[];
  rows: AgeingSummaryRow[];
  totals: {
    pending: number;
    bucketAmounts: AgeingBucketAmount[];
  };
};
