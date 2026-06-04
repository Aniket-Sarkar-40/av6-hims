import {
  InvItem,
  InvItemStock,
  Prisma,
} from "@repo/db/generated/prisma/client";
import {
  BaseModelAttr,
  BaseModelAttrWoCancel,
  IdValue,
} from "@repo/shared/types/global.js";

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
  locationType: string;
  locationName: string | null;
  batchNoList: string;
  expiryDateList: string;
  nearestExpiryDate: string | null;
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
  itemName: string;
  batchNo: string;
}

export interface ItemBatchStockLookupInput {
  itemId: number;
  batchNo: string;
}
