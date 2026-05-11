import { AccountingPrimaryCategory } from "@repo/db/generated/prisma/enums.js";
import { IdValue } from "../global.js";
import { DrCrAmt } from "./ledgerBalanceEngine.js";

export type BsNode = {
  group: IdValue | null;
  parent: IdValue | null;
  amount: DrCrAmt;
  children: BsNode[];
  isSystem?: boolean; // for P&L A/c virtual node
};

export type BalanceSheetResponse = {
  liabilities: BsNode[];
  assets: BsNode[];

  totals: {
    liabilities: number;
    assets: number;
    difference: number; // assets - liabilities (should be 0)
  };

  // Optional: expose current FY P&L (useful for debugging)
  profitLoss: {
    openingBalance: number; // 0 for now
    currentPeriod: number;
    total: number;
    side: "LIABILITIES" | "ASSETS"; // where we placed the node
  };
};

export type BalanceSheetRequestInput = {
  companyId: number;
  financialYearId: number;
  fromDate: Date;
  asOnDate: Date;
  ccId?: number;
  includeZero?: boolean;
};

export type GroupMetaForBalanceSheet = {
  id: number;
  name: string;
  parentId: number | null;
  primaryCategory: AccountingPrimaryCategory;
};

export type InternalNodeForBalanceSheet = GroupMetaForBalanceSheet & {
  amount: DrCrAmt;
  children: InternalNodeForBalanceSheet[];
};
