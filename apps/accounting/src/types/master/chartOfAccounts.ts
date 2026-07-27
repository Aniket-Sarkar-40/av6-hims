import { IdValue } from "@/types/global.js";

export type LedgerForChartOfAccounts = {
  ledger: IdValue;
  parent: IdValue;
};

export type GroupForChartOfAccounts = {
  group: IdValue;
  parent: IdValue | null;
  children: GroupForChartOfAccounts[];
  ledgers: LedgerForChartOfAccounts[];
};

export type ChartOfAccountsSection = {
  name: string;
  groups: GroupForChartOfAccounts[];
};

export type ChartOfAccountsResponse = {
  assets: ChartOfAccountsSection;
  liabilities: ChartOfAccountsSection;
  income: ChartOfAccountsSection;
  expenses: ChartOfAccountsSection;
  totalGroups: number;
  totalLedgers: number;
};
