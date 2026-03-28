import {
  PmsBranch,
  PmsItem,
  PmsItemStock,
  PmsWarehouse,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { PmsOperation } from "@repo/db/generated/prisma/enums.js";
import { DecimalToNumber } from "@repo/platform/types/common.js";
import { EmployeeCache } from "av6-core";

/**
 * Input data for creating a new ItemStock record.
 */
export interface CreateItemStockInput {
  itemId: number;
  warehouseId?: number;
  branchId?: number;
  quantity: number;
  batchNo?: string | null;
  expiryDate?: Date | string | null;
  isFoc?: boolean;
}

export interface ItemStockAudit {
  operation: PmsOperation; // JSON string of new data
  refId?: number;
  refDetailsId?: number;
  refNo?: string | null;
  refDate?: Date;
  refApprovedBy?: number;
  refApprovedAt?: Date;
  createdBy?: number;
}

/**
 * Input data for updating an existing ItemStock record.
 * All fields are optional except `id`.
 */
export interface UpdateItemStockInput {
  id: number;
  warehouseId?: number | null;
  branchId?: number | null;
  quantity?: number;
  batchNo?: string;
  isFoc: boolean;
  expiryDate?: Date | string | null;
  updatedBy?: string | null;
  isActive?: boolean;
  deletedBy?: string | null;
  deletedAt?: Date | string | null;
}

/**
 * DTO returned whenever we fetch an ItemStock row.
 */
export interface ItemStockDTO {
  id: number;
  itemId: number;
  warehouseId: number | null;
  branchId: number | null;
  quantity: number;
  batchNo: string;
  isFoc: boolean;
  expiryDate: Date | null;
  isActive: boolean;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedBy: number | null;
  deletedAt: Date | null;
}

/**
 * Options for pagination + filtering when listing ItemStock entries.
 */
export interface ListItemStockFilters {
  itemId?: number;
  warehouseId?: number;
  branchId?: number;
  isActive?: boolean;
  isFoc?: boolean;
  skip?: number;
  take?: number;
  orderBy?: { [P in keyof ItemStockDTO]?: "asc" | "desc" };
}

export interface FromTo {
  type: "warehouse" | "branch";
  id: number;
}

export interface StockTransferReq {
  from: FromTo;
  to: FromTo;
}

export interface RawItemStock {
  id: number;
  item_id: number;
  warehouse_id: number | null;
  branch_id: number | null;
  quantity: number;
  batch_no: string | null;
  expiry_date: string | null;
  is_active: 1 | 0;
  created_by: number | null;
  updated_by: number | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  deleted_by: number | null;
  deleted_at: string | null; // ISO date string
  is_foc: 1 | 0;
}

export type ItemStockAuditDetails = Prisma.PmsItemStockAuditGetPayload<{
  include: {
    itemStock: true;
  };
}>;

export interface StockAuditDTO extends Omit<
  ItemStockAuditDetails,
  "itemStock" | "itemStockId" | "createdBy"
> {
  itemStock: StockResponse;
  createdBy: EmployeeCache | null;
}

export interface StockResponse extends Omit<
  PmsItemStock,
  "itemId" | "warehouseId" | "branchId"
> {
  item: DecimalToNumber<PmsItem> | null;
  branch: PmsBranch | null;
  warehouse: PmsWarehouse | null;
}

export interface LowStockResponse {
  itemId: number;
  itemName: string;
  collectionCenterName: string;
  ccId: number;
  availableQty: number;
  minStockQty: number;
}

export interface ExpiredItemsResponse {
  itemId: number;
  itemName: string;
  ccId: number;
  collectionCenterName: string;
  quantity: number;
  batchNo: string;
  expiryDate: Date;
  isFoc: boolean;
}
export type ExpiringItemsResponse = {
  data: ExpiredItemsResponse[];
  expiryInMonth: number;
};

export interface updateBatchExpiryInput {
  ids: number[];
  newExp: Date;

  updateExpIds: number[];
  transferableStock: TransferableStockInp[];
}

export interface TransferableStockInp {
  fromStock: PmsItemStock;
  toStock: PmsItemStock;
}

export interface ItemStockBatchWiseDTO extends Pick<
  PmsItemStock,
  "id" | "batchNo" | "expiryDate" | "quantity"
> {
  item: DecimalToNumber<PmsItem> | null;
  stockDetails: StockDetails[];
}

export interface StockDetails extends Omit<
  PmsItemStock,
  "branchId" | "warehouseId"
> {
  branch: PmsBranch | null;
  warehouse: PmsWarehouse | null;
}
