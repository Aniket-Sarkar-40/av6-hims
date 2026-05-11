import { AccountingPrimaryCategory } from "@repo/db/generated/prisma/enums.js";
import { IdValue } from "../global.js";
import { DrCrAmt } from "./ledgerBalanceEngine.js";

export enum FundFlowView {
  MONTHLY = "MONTHLY",
  SUMMARY = "SUMMARY",
  GROUP_DETAIL = "GROUP_DETAIL",
}

export enum SummaryLevel {
  ROOT = "ROOT",
  LOWEST = "LOWEST",
}
export type FundFlowRequestInput = {
  companyId: number;
  financialYearId: number;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
  month?: string; // YYYY-MM, only for SUMMARY / GROUP_DETAIL when opening from monthly
  groupId?: number;
  includeZero?: boolean;
  view: FundFlowView;
  summaryLevel?: SummaryLevel;
};

export type FundFlowMonthlyRow = {
  month: string;
  name: string;
  openingWorkingCapital: number;
  closingWorkingCapital: number;
  fundFlow: number;
};

export type FundFlowSummaryRow = {
  type: "GROUP" | "SYSTEM";
  group: IdValue | null;
  amount: number;
};

export type FundFlowLedgerAmount = {
  opening: DrCrAmt;
  debit: number;
  credit: number;
  closing: DrCrAmt;
};

export type FundFlowLedgerRow = {
  type: "LEDGER";
  ledger: IdValue | null;
  group: IdValue | null;
  amount: FundFlowLedgerAmount;
};

export type FundFlowGroupRecursiveRow = {
  type: "GROUP";
  group: IdValue | null;
  parent: IdValue | null;
  primaryCategory: AccountingPrimaryCategory;
  amount: FundFlowLedgerAmount;
  ledgers: FundFlowLedgerRow[];
  children: FundFlowGroupRecursiveRow[];
};

export type FundFlowMonthlyResponse = {
  view: "MONTHLY";
  months: FundFlowMonthlyRow[];
  totals: {
    openingWorkingCapital: number;
    closingWorkingCapital: number;
    fundFlow: number;
  };
};
type GroupBlock = {
  group: IdValue | null;
  opening: DrCrAmt;
  closing: DrCrAmt;
};
export type FundFlowWorkingCapitalBlock = {
  groups: GroupBlock[];
  openingWorkingCapital: DrCrAmt;
  closingWorkingCapital: DrCrAmt;

  increase: number;
  decrease: number;
};
export type FundFlowSummaryResponse = {
  view: "SUMMARY";
  month?: string;
  sources: FundFlowSummaryRow[];
  applications: FundFlowSummaryRow[];
  workingCapital: FundFlowWorkingCapitalBlock;
  totals: {
    sources: number;
    applications: number;
    difference: number;
  };
};

export type FundFlowGroupDetailResponse = {
  view: "GROUP_DETAIL";
  month?: string;
  groupTree: FundFlowGroupRecursiveRow | null;
  totals: {
    opening: DrCrAmt;
    debit: number;
    credit: number;
    closing: DrCrAmt;
  };
};

export type FundFlowResponse =
  | FundFlowMonthlyResponse
  | FundFlowSummaryResponse
  | FundFlowGroupDetailResponse;

export type FundFlowGroupMovementRow = {
  groupId: number;
  groupName: string;
  parentId: number | null;
  primaryCategory: AccountingPrimaryCategory;
  opening: DrCrAmt;
  closing: DrCrAmt;
  openingSigned: number;
  closingSigned: number;
  movement: number;
  source: number;
  application: number;
};

export type FundFlowLedgerMovementRow = {
  ledgerId: number;
  ledgerName: string;
  groupId: number;
  opening: DrCrAmt;
  debit: number;
  credit: number;
  closing: DrCrAmt;
};

export type InternalFundFlowGroupNode = {
  id: number;
  name: string;
  parentId: number | null;
  primaryCategory: AccountingPrimaryCategory;
  opening: DrCrAmt;
  closing: DrCrAmt;
  openingSigned: number;
  closingSigned: number;
  movement: number;
  source: number;
  application: number;
  children: InternalFundFlowGroupNode[];
};
