import { ItemMasterToDto } from "@/types/grn/grn.js";
import {
  BranchReqBatchWiseResponse,
  ValBranchRequisitionResponse,
} from "@/types/purchase/branchRequisition.js";
import { EmployeeCache } from "@apps/core/types/staff/employee.js";
import {
  BranchRequisitionReturn,
  BranchReturnItemDetails,
  Prisma,
} from "@repo/db/generated/prisma/client";
import {
  STORE_REQ_ACK_STATUS,
  STORE_REQ_STATUS,
} from "@repo/db/generated/prisma/enums.js";
import { IdValue } from "@repo/shared/types/global.js";

export interface CreateBranchRequisitionReturnInput {
  id?: number;

  requisitionFrom: number;
  branchRequisitionId: number;
  ccId: number;
  branchId: number;

  returnStatus?: STORE_REQ_STATUS;
  returnReason?: string;
  returnDetails?: string;

  returnItems: BranchReturnItem[];

  branchReq: ValBranchRequisitionResponse;
  branchReqReturn?: ValBranchRequisitionReturnResponse;
}

export interface BranchReturnItem {
  branchRequisitionDetailsId: number;
  itemId: number;
  requestedReturnQty: number;
  itemBatch: BranchReturnItemBatch[];
}

export interface BranchReturnItemBatch {
  isBatch: boolean;
  isExpiry: boolean;

  branchItemDetailsId: number;
  returnQty: number;
  batchNo?: string | null;
  expiryDate?: string | null;
  isFoc: boolean;
  comment?: string | null;
}

export interface ApproveBranchReturnItemBatch
  extends Omit<BranchReturnItemBatch, "branchItemDetailsId"> {
  id: number;
}

export interface AcknowledgeBranchReturnItemBatch
  extends Omit<
    BranchReturnItemBatch,
    "branchItemDetailsId" | "returnQty" | "comment"
  > {
  id: number;
  acknowledgedQty: number;
  isCompleted: boolean;
}

export interface ApproveBranchReturnItem
  extends Omit<BranchReturnItem, "itemBatch" | "branchRequisitionDetailsId"> {
  id: number;
  itemBatch: ApproveBranchReturnItemBatch[];
}

export interface AcknowledgeBranchReturnItem
  extends Omit<
    BranchReturnItem,
    "itemBatch" | "branchRequisitionDetailsId" | "requestedReturnQty"
  > {
  id: number;
  acknowledgedReturnQty: number;
  itemBatch: AcknowledgeBranchReturnItemBatch[];
}

export type ValBranchRequisitionReturnResponse =
  Prisma.BranchRequisitionReturnGetPayload<{
    include: {
      branchRequisitionReturnDetails: {
        where: {
          isActive: true;
        };
        include: {
          branchReturnItemDetails: {
            where: {
              isActive: true;
            };
          };
        };
      };
    };
  }>;

export type GetBranchRequisitionReturnResponse =
  Prisma.BranchRequisitionReturnGetPayload<{
    include: {
      branchRequisitionReturnDetails: {
        where: {
          isActive: true;
        };
        include: {
          branchReturnItemDetails: {
            where: {
              isActive: true;
            };
          };
        };
      };
    };
  }>;

export interface BranchRequisitionReturnDetailDTO
  extends BranchReturnItemDetails {
  item: ItemMasterToDto | null;

  reqAcknowledgedQty: number | null;
  alreadyReturnedQty: number | null;

  totalRequestedReturnQty: number;
  totalAcknowledgedReturnQty: number;

  branchInHandStock: number | null;
  warehouseInHandStock: number | null;
}

export interface BranchRequisitionReturnDTO
  extends Omit<
    BranchRequisitionReturn,
    | "requisitionFrom"
    | "ccId"
    | "branchId"
    | "approvedBy"
    | "rejectBy"
    | "acknowledgementBy"
  > {
  requisitionFrom: IdValue | null;
  warehouse: IdValue | null;
  branch: IdValue | null;

  approvedBy: EmployeeCache | null;
  rejectBy: EmployeeCache | null;
  acknowledgementBy: EmployeeCache | null;

  branchRequisitionReturnDetails: BranchRequisitionReturnDetailDTO[];
}

export interface RejectBranchRequisitionReturnInput {
  id: number;
  branchId: number;
}

export interface ApproveBranchReqReturnInput {
  id: number;
  branchId: number;
  returnItems: ApproveBranchReturnItem[];

  returnStatus?: STORE_REQ_STATUS;

  branchReq: BranchReqBatchWiseResponse;
  branchReqReturn: ValBranchRequisitionReturnResponse;
}

export interface AcknowledgeBranchRequisitionReturn {
  id: number;
  ccId: number;
  acknowledgeItems: AcknowledgeBranchReturnItem[];

  ackStatus?: STORE_REQ_ACK_STATUS;

  branchReqReturn: ValBranchRequisitionReturnResponse;
}

export interface BrReturnDetailDTO
  extends Omit<BranchReturnItemDetails, "itemId" | "createdBy" | "updatedBy"> {
  item: ItemMasterToDto | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
}
