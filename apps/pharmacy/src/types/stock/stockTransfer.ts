import {
  PMS_STR_RETURN_STATUS,
  PMS_STR_STATUS,
  PmsBranch,
  PmsWarehouse,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { ItemDTO } from "../item/item.js";
import { EmployeeCache, EmployeeDTO } from "../staff/employee.js";
import { FromTo } from "./stock.js";

interface CreateItemStockInput {
  id?: number;
  itemId: number;
  warehouseId?: number;
  branchId?: number;
  quantity: number;
  batchNo: string | null;
  isFoc: boolean;
  expiryDate: Date | string;
  acknowledgedQuantity: number;
  returnQuantity: number;
}

export interface CreateItemStockTransferInput {
  items: CreateItemStockInput[];
  staffId: number;
  ccId: FromTo;
  from: FromTo;
  to: FromTo;
  warehouse: PmsWarehouse | null;
}

export interface StockTransferAcknowledgeInput {
  id: number;
  ccId: number;
  items: CreateItemStockInput[];
  stockTransfer: StockTransferResponse;
  status: PMS_STR_STATUS;
  returnStatus: PMS_STR_RETURN_STATUS;
}
export interface UpdateItemStockTransferInput extends CreateItemStockTransferInput {
  id: number;
  stockTransfer: StockTransferResponse;
}

export type StockTransferResponse = Prisma.PmsStockTransferGetPayload<{
  include: {
    stockTransferDetails: {
      where: { isActive: true };
    };
  };
}>;

export interface StockTransferUpdate {
  id: number;
  ccId: number;
}

export interface StockTransferDTO {
  id: number;
  stockTransferNumber: string;
  staff: EmployeeDTO | null;
  ccId: PmsWarehouse | null;
  from: PmsWarehouse | PmsBranch | null;
  to: PmsWarehouse | PmsBranch | null;
  date: Date;
  status: PMS_STR_STATUS;
  returnStatus: PMS_STR_RETURN_STATUS | null;
  createdBy: EmployeeCache | null;
  createdAt: Date;
  updatedBy: number | null;
  updatedAt: Date | null;
  approvedBy: EmployeeCache | null;
  approvedAt: Date | null;
  acknowledgedBy: EmployeeCache | null;
  acknowledgedAt: Date | null;
  returnApprovedBy: EmployeeCache | null;
  returnApprovedAt: Date | null;
  stockTransferDetails: StockTransferDetailsDTO[];
}

export interface StockTransferDetailsDTO {
  id: number;
  stId: number;
  item: ItemDTO | null;
  batchNo: string;
  isFoc: boolean;
  expiryDate: Date;
  quantity: number;
  acknowledgedQuantity: number;
  returnQuantity: number | null;
  fromBranchItemQty: number;
  toBranchItemQty: number;
}

export interface StockTransferSearchInput {
  pageNo: number;
  pageSize: number;
  searchText?: string;
  sortBy: string;
  sortDir: "ASC" | "DESC";
  startDate?: string;
  endDate?: string;
  status?: PMS_STR_STATUS;
  returnStatus?: PMS_STR_RETURN_STATUS;
  ccId?: number;
  staffId?: number;
}
