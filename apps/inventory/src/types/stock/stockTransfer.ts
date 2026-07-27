import { ItemMasterToDto } from "@/types/grn/grn.js";
import { ItemMasterDto } from "@/types/master/itemMaster.js";
import { EmployeeCache } from "@apps/core/types/staff/employee.js";
import {
  InvStockTransfer,
  InvStockTransferDetails,
  Prisma,
  ST_RETURN_STATUS,
  ST_STATUS,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttr, IdValue } from "@repo/shared/types/global.js";

export type CreateInvStockTransferDetailsInput = Omit<
  Prisma.InvStockTransferDetailsCreateManyInput,
  BaseModelAttr
>;

export interface CreateItemStockTransferInput extends Omit<
  Prisma.InvStockTransferUncheckedCreateInput,
  BaseModelAttr | "stockTransferDetails" | "id"
> {
  stockTransferDetails: CreateInvStockTransferDetailsInput[];
}

export interface StockTransferAcknowledgeInput {
  id: number;
  ccId: number;
  stockTransferDetails: CreateInvStockTransferDetailsInput[];
  stockTransfer: StockTransferResponse;
  status: ST_STATUS;
  returnStatus: ST_RETURN_STATUS;
}
export interface UpdateItemStockTransferInput extends CreateItemStockTransferInput {
  id: number;
  stockTransfer: StockTransferResponse;
}

export type StockTransferResponse = Prisma.InvStockTransferGetPayload<{
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

export interface StockTransferDTO extends Omit<
  InvStockTransfer,
  | BaseModelAttr
  | "ccId"
  | "fromId"
  | "toId"
  | "staffId"
  | "createdBy"
  | "approvedBy"
  | "acknowledgedBy"
  | "returnApprovedBy"
> {
  staff: EmployeeCache | null;
  cc: IdValue | null;
  from: IdValue | null;
  to: IdValue | null;
  createdBy: EmployeeCache | null;
  approvedBy: EmployeeCache | null;
  acknowledgedBy: EmployeeCache | null;
  returnApprovedBy: EmployeeCache | null;
  stockTransferDetails: StockTransferDetailsDTO[];
}

export interface StockTransferDetailsDTO extends Omit<
  InvStockTransferDetails,
  BaseModelAttr
> {
  item: ItemMasterDto | null;
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
  status?: ST_STATUS;
  returnStatus?: ST_RETURN_STATUS;
  ccId?: number;
  staffId?: number;
}

export type StockTransferDetailsResponse = Prisma.InvStockTransferGetPayload<{
  include: {
    stockTransferDetails: true;
  };
}>;

export interface StockTransferDetailRowDTO extends Omit<
  InvStockTransferDetails,
  "itemId" | "createdBy" | "updatedBy" | "deletedBy"
> {
  item: ItemMasterToDto | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
}
