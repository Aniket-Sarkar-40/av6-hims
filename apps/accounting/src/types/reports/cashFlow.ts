import { IdValue } from "../global.js";

export enum CashFlowView {
  MONTHLY = "MONTHLY",
  MONTH_DETAIL = "MONTH_DETAIL",
  GROUP_DETAIL = "GROUP_DETAIL",
}

export type CashFlowRequestInput = {
  companyId: number;
  financialYearId: number;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
  month?: string; // YYYY-MM
  groupId?: number;
  includeZero?: boolean;
  view: CashFlowView;
};

export type CashFlowAmount = {
  inflow: number;
  outflow: number;
  net: number;
};

export type CashFlowNode = {
  group: IdValue | null;
  parent: IdValue | null;
  amount: CashFlowAmount;
  children: CashFlowNode[];
};

export type CashFlowMonthRow = {
  month: string;
  name: string;
  openingBalance: number;
  closingBalance: number;
  amount: CashFlowAmount;
};

export type CashFlowLedgerRow = {
  type: "LEDGER";
  ledger: IdValue | null;
  group: IdValue | null;
  amount: CashFlowAmount;
};

export type CashFlowGroupRecursiveRow = {
  type: "GROUP";
  group: IdValue | null;
  parent: IdValue | null;
  amount: CashFlowAmount;
  ledgers: CashFlowLedgerRow[];
  children: CashFlowGroupRecursiveRow[];
};

export type CashFlowMonthlyResponse = {
  view: "MONTHLY";
  openingBalance: number;
  closingBalance: number;
  totalInflow: number;
  totalOutflow: number;
  netFlow: number;
  months: CashFlowMonthRow[];
};

export type CashFlowMonthDetailResponse = {
  view: "MONTH_DETAIL";
  month: string;
  openingBalance: number;
  closingBalance: number;
  inflows: CashFlowNode[];
  outflows: CashFlowNode[];
  totals: CashFlowAmount;
};

export type CashFlowGroupDetailResponse = {
  view: "GROUP_DETAIL";
  month?: string;
  openingBalance: number;
  closingBalance: number;
  groupTree: CashFlowGroupRecursiveRow | null;
  totals: CashFlowAmount;
};

export type CashFlowResponse =
  | CashFlowMonthlyResponse
  | CashFlowMonthDetailResponse
  | CashFlowGroupDetailResponse;

export type CashFlowMovementRow = {
  voucherId: number;
  voucherNo: string | null;
  voucherDate: Date;
  narration?: string | null;

  month: string;

  group: IdValue | null;
  parentGroup: IdValue | null;
  ledger: IdValue | null;

  inflow: number;
  outflow: number;
  net: number;
};

export type InternalCashFlowNode = {
  id: number;
  name: string;
  parentId: number | null;
  amount: CashFlowAmount;
  children: InternalCashFlowNode[];
};
