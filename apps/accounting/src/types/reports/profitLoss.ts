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

/**
 * Inventory Opening and Closing Stock Request
 */

export interface InventoryOpeningAndClosingStockRequest {
  financialYearId: number;
  fromDate: Date;
  toDate: Date;
  ccId?: number;
}

export const STOCK_SUMMARY_TYPE = {
  ITEM_STOCK: "ITEM_STOCK",
  IN_TRANSIT_STOCK: "IN_TRANSIT_STOCK",
} as const;

export type StockSummaryType =
  (typeof STOCK_SUMMARY_TYPE)[keyof typeof STOCK_SUMMARY_TYPE];
export interface StockOpeningClosingRow {
  stockType: StockSummaryType;

  itemId: number;
  itemName: string | null;
  itemCode: string | null;
  categoryId: number | null;
  categoryName: string | null;

  ccId: number | null;
  fromCcId: number | null;
  toCcId: number | null;
  userId: number | null;

  batchNo: string | null;
  expiryDate: Date | string | null;
  isFoc: boolean;

  openingQty: number;
  openingAmount: number;

  inQty: number;
  outQty: number;
  netQty: number;

  inAmount: number;
  outAmount: number;
  netAmount: number;

  closingQty: number;
  closingAmount: number;
}

export interface StockOpeningClosingTotals {
  openingQty: number;
  openingAmount: number;

  inQty: number;
  outQty: number;
  netQty: number;

  inAmount: number;
  outAmount: number;
  netAmount: number;

  closingQty: number;
  closingAmount: number;
}

export interface StockOpeningClosingResponse {
  rows: StockOpeningClosingRow[];
  totals: StockOpeningClosingTotals;
  totalRecords: number;
}
