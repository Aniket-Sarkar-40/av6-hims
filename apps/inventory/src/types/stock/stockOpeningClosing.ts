import { Prisma } from "@repo/db/generated/prisma/client";

export const STOCK_SUMMARY_TYPE = {
  ITEM_STOCK: "ITEM_STOCK",
  IN_TRANSIT_STOCK: "IN_TRANSIT_STOCK",
} as const;

export type StockSummaryType =
  (typeof STOCK_SUMMARY_TYPE)[keyof typeof STOCK_SUMMARY_TYPE];

export type StockOpeningClosingGroupBy =
  | "ITEM"
  | "ITEM_LOCATION"
  | "ITEM_BATCH"
  | "ITEM_LOCATION_BATCH"
  | "FULL";

export type StockOpeningClosingSortBy =
  | "itemName"
  | "itemCode"
  | "openingQty"
  | "openingAmount"
  | "inQty"
  | "outQty"
  | "netQty"
  | "inAmount"
  | "outAmount"
  | "netAmount"
  | "closingQty"
  | "closingAmount";

export interface StockOpeningClosingFilter {
  financialYearId: number;

  fromDate: string | Date;
  toDate: string | Date;

  stockType?: StockSummaryType;

  itemId?: number;
  itemIds?: number[];

  categoryId?: number;
  categoryIds?: number[];

  ccId?: number;
  ccIds?: number[];

  fromCcId?: number;
  fromCcIds?: number[];

  toCcId?: number;
  toCcIds?: number[];

  userId?: number;
  userIds?: number[];

  batchNo?: string;
  batchNos?: string[];

  expiryDate?: string | Date;
  isFoc?: boolean;

  searchText?: string;

  groupBy?: StockOpeningClosingGroupBy;

  includeZero?: boolean;

  // pageNo?: number;
  // pageSize?: number;

  sortBy?: StockOpeningClosingSortBy;
  sortDir?: "ASC" | "DESC";
}

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
  // currentPageNumber: number;
  // lastPageNumber: number;
  // pageSize: number;
}

export type RawStockOpeningClosingRow = StockOpeningClosingRow & {
  totalRecords: bigint | number;

  totalOpeningQty: Prisma.Decimal | number | string | null;
  totalOpeningAmount: Prisma.Decimal | number | string | null;

  totalInQty: Prisma.Decimal | number | string | null;
  totalOutQty: Prisma.Decimal | number | string | null;
  totalNetQty: Prisma.Decimal | number | string | null;

  totalInAmount: Prisma.Decimal | number | string | null;
  totalOutAmount: Prisma.Decimal | number | string | null;
  totalNetAmount: Prisma.Decimal | number | string | null;

  totalClosingQty: Prisma.Decimal | number | string | null;
  totalClosingAmount: Prisma.Decimal | number | string | null;
};
