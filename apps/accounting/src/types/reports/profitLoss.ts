import { AccountingPrimaryCategory } from "@repo/db/generated/prisma/enums.js";
import { DrCrAmt } from "./ledgerBalanceEngine.js";

export type PlGroupRes = {
  id: number;
  name: string;
  affectsGrossProfit: boolean;
};
export type PlNode = {
  group: PlGroupRes;
  parent: PlGroupRes | null;
  amount: DrCrAmt;
  children: PlNode[];
};

export type ProfitLossResponse = {
  income: PlNode[];
  expense: PlNode[];

  totals: {
    directIncome: number;
    directExpense: number;
    grossProfit: number; // income - expense (direct)
    indirectIncome: number;
    indirectExpense: number;
    netProfit: number; // gross + indirectIncome - indirectExpense
  };
};

export type GroupMeta = {
  id: number;
  name: string;
  parentId: number | null;
  primaryCategory: AccountingPrimaryCategory;
  affectsGrossProfit: boolean;
};

export type InternalNode = GroupMeta & {
  amount: DrCrAmt;
  children: InternalNode[];
};
