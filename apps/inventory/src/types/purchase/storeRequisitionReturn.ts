import {
  STORE_REQ_ACK_STATUS,
  STORE_REQ_STATUS,
} from "@repo/db/generated/prisma/enums.js";
import { ItemMasterToDto } from "../grn/grn.js";
import {
  StoreReqBatchWiseResponse,
  StoreReqValResponse,
} from "./storeRequisition.js";
import {
  Prisma,
  RequisitionReturnItemDetails,
  StoreRequisitionReturn,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";
import { EmployeeCache } from "@apps/core/types/staff/employee.js";

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
  itemId?: number;

  returnQty: number;
  batchNo?: string | null;
  expiryDate?: string | null;
  isFoc: boolean;
  isBatch: boolean;
  isExpiry: boolean;
  comment?: string | null;
}

export interface ApproveReturnItemBatch
  extends Omit<ItemBatch, "requisitionItemDetailsId" | "itemId"> {
  id: number;
}

export interface AcknowledgeReturnItemBatch
  extends Omit<
    ItemBatch,
    "requisitionItemDetailsId" | "itemId" | "returnQty" | "comment"
  > {
  id: number;
  acknowledgedQty: number;
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
  acknowledgedReturnQty: number;
  itemBatch: AcknowledgeReturnItemBatch[];
}

export type ValStoreRequisitionReturnResponse =
  Prisma.StoreRequisitionReturnGetPayload<{
    include: {
      storeRequisitionReturnDetails: {
        where: {
          isActive: true;
        };
      };
    };
  }>;

export type GetStoreRequisitionReturnResponse =
  Prisma.StoreRequisitionReturnGetPayload<{
    include: {
      storeRequisitionReturnDetails: {
        where: {
          isActive: true;
        };
        include: {
          requisitionReturnItemDetails: {
            where: {
              isActive: true;
            };
          };
        };
      };
    };
  }>;

export interface StoreRequisitionReturnDetailDTO
  extends RequisitionReturnItemDetails {
  item: ItemMasterToDto | null;

  reqAcknowledgedQty: number | null;
  alreadyReturnedQty: number | null;

  totalRequestedReturnQty: number;
  totalAcknowledgedReturnQty: number;

  branchInHandStock: number | null;
  userInHandStock: number | null;
}

export interface StoreRequisitionReturnDTO
  extends Omit<
    StoreRequisitionReturn,
    "requisitionFrom" | "ccId" | "approvedBy" | "rejectBy" | "acknowledgementBy"
  > {
  requisitionFrom: IdValue | null;
  branch: IdValue | null;
  cc: IdValue | null;

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
  ccId: number;
  returnItems: ApproveReturnItem[];

  returnStatus?: STORE_REQ_STATUS;

  storeReq: StoreReqBatchWiseResponse;
  storeReqReturn: GetStoreRequisitionReturnResponse;
}

export interface AcknowledgeRequisitionReturn {
  id: number;
  ccId: number;
  acknowledgeItems: AcknowledgeReturnItem[];

  ackStatus?: STORE_REQ_ACK_STATUS;

  storeReqReturn: GetStoreRequisitionReturnResponse;
}
