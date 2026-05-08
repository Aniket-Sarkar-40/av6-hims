import { CommonFilterRequest } from "av6-core-v2";

export interface SearchRequestMisBranch extends CommonFilterRequest {
  ccId?: number;
  medCategoryId?: number;
  isExpired?: boolean;
}

export interface ItemStockSummary {
  id: number;
  code: string;
  category: string;
  description: string;
  physicalQty: number;
  expiryDate: Date | null;
  batchNo: string | null;
  branchName?: string;
  warehouseName?: string;
  unitCost: number;
  total: number;
}

export interface BranchMonthlySalesSummary {
  branches: string;
  January: number;
  February: number;
  March: number;
  April: number;
  May: number;
  June: number;
  July: number;
  August: number;
  September: number;
  October: number;
  November: number;
  December: number;
}

export interface QuarterWise {
  period: "Q1" | "Q2" | "Q3" | "Q4" | "TOTAL";
  amount: number;
}

export interface SalesDashboardData {
  monthWise: BranchMonthlySalesSummary[];
  quarterWise: QuarterWise[];
}

export interface GoodReceiveMonthlySummary {
  month: string;
  amount: number;
}

export interface GoodReceiveQuarterSummary {
  period: string;
  amount: number;
}

export interface GoodReceiveDashboardData {
  monthWise: GoodReceiveMonthlySummary[];
  quarterWise: GoodReceiveQuarterSummary[];
}

export interface SupplierPaymentSchedule {
  id: number;
  supplier: string;
  amount: number;
  invoiceNo: string;
  branch: string;
  creditDays: string;
  invoiceDate: Date;
  dateSupplied: Date;
  dueDate: Date;
}

export interface SupplierPaymentScheduleResult {
  rows: SupplierPaymentSchedule[];
  totalAmount: number;
}

export interface BranchOnMonthRow {
  id: number;
  itemName: string;
  branch: string;
  sellingPrice: number;
  physicalQty: number;
  total: number;
  batch: string;
  expiryDate: Date;
}
