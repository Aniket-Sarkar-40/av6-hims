import {
  StoreReqBatchWiseResponse,
  StoreReqValResponse,
} from "./storeRequisition.js";
import { EmployeeCache } from "../staff/employee.js";
import { ItemDTO } from "../item/item.js";
import {
  STORE_REQ_ACK_STATUS,
  STORE_REQ_STATUS,
} from "@repo/db/generated/prisma/enums.js";
import {
  PmsRequisitionReturnItemDetails,
  PmsStoreRequisitionReturn,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";

export interface CreateStoreRequisitionReturnInput {
  id?: number;
  requisitionFrom: number;
  storeRequisitionId: number;
  ccId: number;
  returnStatus?: STORE_REQ_STATUS;
  returnReason?: string;
  returnDetails?: string;
  returnItems: ReturnItem[];

  storeReq: StoreReqValResponse;
  storeReqReturn?: ValStoreRequisitionReturnResponse;
}

export interface ReturnItem {
  storeRequisitionDetailsId: number;
  itemId: number;
  requestedReturnQty: number;
  itemBatch: ItemBatch[];
}

export interface ItemBatch {
  requisitionItemDetailsId: number;
  returnQty: number;
  batchNo: string;
  expiryDate?: string;
  isFoc: boolean;
  comment?: string;
}

export interface ApproveReturnItemBatch
  extends Omit<ItemBatch, "requisitionItemDetailsId"> {
  id: number;
}

export interface AcknowledgeReturnItemBatch
  extends Omit<
    ItemBatch,
    "requisitionItemDetailsId" | "returnQty" | "comment"
  > {
  id: number;
  acknowledgeQty: number;
  isCompleted: boolean;
}

export interface ApproveReturnItem
  extends Omit<ReturnItem, "itemBatch" | "storeRequisitionDetailsId"> {
  id: number;
  itemBatch: ApproveReturnItemBatch[];
}

export interface AcknowledgeReturnItem
  extends Omit<
    ReturnItem,
    "itemBatch" | "storeRequisitionDetailsId" | "requestedReturnQty"
  > {
  id: number;
  acknowledgedQuantity: number;
  itemBatch: AcknowledgeReturnItemBatch[];
}

export type ValStoreRequisitionReturnResponse =
  Prisma.PmsStoreRequisitionReturnGetPayload<{
    include: {
      storeRequisitionReturnDetails: {
        where: { isActive: true };
      };
    };
  }>;

export type GetStoreRequisitionReturnResponse =
  Prisma.PmsStoreRequisitionReturnGetPayload<{
    include: {
      storeRequisitionReturnDetails: {
        where: { isActive: true };
        include: {
          requisitionReturnItemDetails: {
            where: { isActive: true };
          };
        };
      };
    };
  }>;

export interface StoreRequisitionReturnDetailDTO
  extends PmsRequisitionReturnItemDetails {
  item: ItemDTO | null;
  storeRequisitionDetailsId: number;
  reqAcknowledgedQty: number | null;
  alreadyReturnedQty: number | null;
  totalRequestedReturnQty: number;
  totalAcknowledgedReturnQty: number;
  branchInHandStock: number;
  warehouseInHandStock: number;
}

export interface StoreRequisitionReturnDTO
  extends Omit<
    PmsStoreRequisitionReturn,
    | "requisitionFrom"
    | "branchId"
    | "warehouseId"
    | "approvedBy"
    | "rejectBy"
    | "acknowledgementBy"
  > {
  requisitionFrom: IdValue | null;
  branch: IdValue | null;
  warehouse: IdValue | null;
  approvedBy: EmployeeCache | null;
  rejectBy: EmployeeCache | null;
  acknowledgementBy: EmployeeCache | null;
  storeRequisitionReturnDetails: StoreRequisitionReturnDetailDTO[];
}

export interface RejectStoreRequisitionReturnInput {
  id: number;
  ccId: number;
}

export interface ApproveStoreReqReturnInput {
  id: number;
  returnItems: ApproveReturnItem[];
  ccId: number;

  storeReqStatus?: STORE_REQ_STATUS;
  storeReq: StoreReqBatchWiseResponse;
  storeReqReturn: ValStoreRequisitionReturnResponse;
}

export interface AcknowledgeRequisitionReturn {
  id: number;
  ccId: number;
  acknowledgeItems: AcknowledgeReturnItem[];

  storeReqAckStatus?: STORE_REQ_ACK_STATUS;
  storeReqReturn: ValStoreRequisitionReturnResponse;
}
