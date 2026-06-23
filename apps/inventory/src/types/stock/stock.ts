import { PaginatedResponse } from "@/types/common.js";
import {
  InvItem,
  InvItemStock,
  InvOperation,
  Prisma,
} from "@repo/db/generated/prisma/client";
import {
  BaseModelAttr,
  BaseModelAttrWoCancel,
  IdValue,
} from "@repo/shared/types/global.js";
import { NewSearchRequest } from "av6-core-v2";

export interface CreateItemStockInput
  extends Omit<Prisma.InvItemStockUncheckedCreateInput, "id" | BaseModelAttr> {
  quantity: number;
}
export interface UpdateItemStockInput extends CreateItemStockInput {
  id: number;
}

export type ItemStockAudit = Omit<
  Prisma.InvItemStockAuditUncheckedCreateInput,
  "id" | "itemStockId" | "action" | BaseModelAttr
>;

export type ItemStockResponse = Prisma.InvItemStockGetPayload<{
  include: {
    collectionCenter: true;
  };
}>;
export interface ItemStockDTO
  extends Omit<
    InvItemStock,
    BaseModelAttrWoCancel | "ccId" | "userId" | "itemId"
  > {
  item: InvItem | null;
  user: IdValue | null;
}

export interface ItemStockByBatchInput {
  itemId: number;
  batchNo?: string | null;
  ccId?: number | null;
  userId?: number;
  expiryDate?: Date | null;
  isFoc?: boolean;
}

export interface RawItemStock {
  id: number;
  item_id: number;
  cc_id: number | null;
  user_id: number | null;
  quantity: number;
  batch_no: string | null;
  expiry_date: string | null;
  is_active: 1 | 0;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_by: number | null;
  deleted_at: string | null;
  is_foc: 1 | 0;

  normal_qty?: number;
  foc_qty?: number;
  total_qty?: number;
}

export type ItemStockWithQtyBreakdown = InvItemStock & {
  normalQty?: number;
  focQty?: number;
  totalQty?: number;
};

export interface ItemStockReportRow {
  itemId: number;
  itemName: string;
  itemCode: string;
  itemDescription: string | null;
  basePrice: number;
  lastPurchasedPrice: number | null;
  reOrderLevel: number | null;
  isBatchNumber: boolean;
  isExpireDate: boolean;
  isReturnable: boolean;
  itemIsLock: boolean;
  itemIsActive: boolean;
  categoryId: number | null;
  categoryName: string | null;
  unitId: number | null;
  unitName: string | null;
  unitSize: string | null;
  ccId: number;
  userId?: number | null;
  locationType: string;
  locationName: string | null;
  batchNoList: string;
  expiryDateList: string;
  nearestExpiryDate: string | null;
  batchDetails: ItemStockBatchDetail[];
  stockIdList: string;
  stockRowCount: number;
  stockInHandQty: number;
  stockNormalQty: number;
  stockFocQty: number;
  poOrderedQty: number;
  poReceivedQty: number;
  poPendingQty: number;
  grnOrderedQty: number;
  grnReceivedQty: number;
  grnDetailReturnQty: number;
  grnReturnRequestedQty: number;
  grnReturnPendingQty: number;
  grnReturnApprovedQty: number;
  grnReturnRejectedQty: number;
  storeReqQty: number;
  storeReqPendingQty: number;
  storeReqApprovedQty: number;
  storeReqRejectedQty: number;
  storeAssignedQty: number;
  storeAcknowledgedQty: number;
  storeReturnedQty: number;
  storePendingAssignQty: number;
  storePendingAckQty: number;
  storeReturnRequestedQty: number;
  storeReturnPendingQty: number;
  storeReturnApprovedQty: number;
  storeReturnRejectedQty: number;
  storeReturnAcknowledgedQty: number;
  storeReturnAckPendingQty: number;
  branchReqQty: number;
  branchReqPendingQty: number;
  branchReqApprovedQty: number;
  branchReqRejectedQty: number;
  branchAssignedQty: number;
  branchAcknowledgedQty: number;
  branchReturnedQty: number;
  branchPendingAssignQty: number;
  branchPendingAckQty: number;
  branchReturnRequestedQty: number;
  branchReturnPendingQty: number;
  branchReturnApprovedQty: number;
  branchReturnRejectedQty: number;
  branchReturnAcknowledgedQty: number;
  branchReturnAckPendingQty: number;
  consumptionRequestedQty: number;
  consumptionPendingQty: number;
  consumptionApprovedQty: number;
  consumptionRejectedQty: number;
  consumedQty: number;
  purchasePrice: number;
}

export interface ItemStockSummaryRow {
  itemId: number;
  itemName: string;
  itemCode: string;
  itemDescription: string | null;
  basePrice: number;
  isBatchNumber: boolean;
  isExpireDate: boolean;
  isReturnable: boolean;
  itemIsLock: boolean;
  itemIsActive: boolean;
  categoryId: number | null;
  categoryName: string | null;
  unitId: number | null;
  unitName: string | null;
  unitSize: string | null;
  ccId: number;
  locationType: string;
  locationName: string | null;
  batchNo: string | null;
  expiryDate: string | null;
  stockIdList: string | null;
  inHandQty: number;
  branchInHandQty: number;
  warehouseInHandQty: number;
  reqQty: number;
  assignedQty: number;
  acknowledgedQty: number;
  pendingQty: number;
  ackPendingQty: number;
  orderedQty: number;
  receivedQty: number;
  returnedQty: number;
  consumptionRequestedQty: number;
  consumedQty: number;
  movementBalance: number;
  varianceVsStock: number;
  purchasePrice: number;
}

export interface ItemBatchStockCacheDTO {
  id: number;
  itemId: number;
  batchNo: string | null;
  itemName: string;
}

export interface ItemBatchStockDTO {
  itemId: number;
  itemName: string;
  batchNo: string;
}

export interface ItemBatchStockLookupInput {
  itemId: number;
  batchNo: string;
}

export type InTransitStockByBatchInput = {
  itemId: number;
  batchNo?: string | null;
  fromCcId?: number | null;
  toCcId?: number | null;
  userId?: number | null;
  expiryDate?: Date | string | null;
  isFoc?: boolean;
};

export type InTransitStockByRefBatchInput = {
  itemId: number;
  batchNo?: string | null;
  fromCcId?: number | null;
  toCcId?: number | null;
  userId?: number | null;
  expiryDate?: Date | string | null;
  isFoc?: boolean;
  operation: InvOperation;
  refId: number;
  refDetailsId: number;
};

export interface ItemStockSearchFilter
  extends Omit<NewSearchRequest, "searchColumns" | "includes"> {
  ccId: number;
  userId?: number | null;
  itemId?: number | null;
  categoryId?: number | null;
}

export type ItemStockPaginatedDTO = PaginatedResponse<ItemStockReportRow>;

export type ItemStockReportRawRow = Omit<ItemStockReportRow, "batchDetails"> & {
  batchDetailsJson?: unknown;
  totalRecords?: bigint;
};

export interface ItemStockPaginatedRes {
  rows: ItemStockReportRawRow[];
  totalRecords: number;
  currentPageNumber: number;
  lastPageNumber: number;
  pageSize: number;
}

export interface ItemStockBatchDetail {
  stockId: number;
  batchNo: string | null;
  expiryDate: string | null;
  isFoc: boolean;
  quantity: number;
}

export type ItemStockExcelRow = Omit<
  ItemStockReportRow,
  | "batchDetails"
  | "batchNoList"
  | "expiryDateList"
  | "stockIdList"
  | "stockRowCount"
  | "nearestExpiryDate"
> & {
  sNo: number;
  stockId: number | null;
  batchNo: string;
  expiryDate: string;
  isFoc: string;
  batchQty: number;
};

export type ItemStockExcelExportFilter = Omit<
  ItemStockSearchFilter,
  "pageNo" | "pageSize"
>;

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

export interface LowStockResponse {
  itemId: number;
  itemName: string;
  collectionCenterName: string;
  ccId: number;
  availableQty: number;
  minStockQty: number;
}
