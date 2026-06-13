// import { Prisma, STORE_REQ_ACK_STATUS, STORE_REQ_STATUS } from "@prisma/client";
// import { BaseModelAttrWoCancel, IdValue } from "../common";
// import { EmployeeCache } from "../employee";
// import { ItemMasterToDto } from "../grn/grn";

import { ItemMasterToDto } from "@/types/grn/grn.js";
import { EmployeeCache } from "@apps/core/types/staff/employee.js";
import {
  Prisma,
  STORE_REQ_ACK_STATUS,
  STORE_REQ_STATUS,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel, IdValue } from "@repo/shared/types/global.js";

export type BranchRequisitionDetailInput =
  Prisma.BranchRequisitionDetailsUncheckedCreateWithoutBranchRequisitionInput & {
    branchInHandStock: number;
    warehouseInHandStock: number;
  };

export type CreateBranchRequisitionInput = Omit<
  Prisma.BranchRequisitionUncheckedCreateInput,
  "branchRequisitionDetails" | "branchItemDetails"
> & {
  branchRequisitionDetails: BranchRequisitionDetailInput[];
  branchReq?: ValBranchRequisitionResponse;
  locationId: number;
};

export type BranchBaseInclude = {
  branchRequisitionDetails: {
    where: { isActive: true };
  };
  branchItemDetails: {
    where: { isActive: true };
  };
};

export type ValBranchRequisitionResponse = Prisma.BranchRequisitionGetPayload<{
  include: BranchBaseInclude;
}>;

export type BranchRequisitionResponse = Prisma.BranchRequisitionGetPayload<{
  include: BranchBaseInclude;
}>;

export type BranchRequisitionDetails =
  Prisma.BranchRequisitionDetailsGetPayload<Record<string, never>>;

export interface BranchRequisitionDTO
  extends Omit<
    ValBranchRequisitionResponse,
    | BaseModelAttrWoCancel
    | "ccId"
    | "branchId"
    | "createdBy"
    | "updatedBy"
    | "approvedBy"
    | "rejectBy"
    | "acknowledgementBy"
    | "requisitionFrom"
    | "branchRequisitionDetails"
  > {
  isAnyPendingReturn: boolean;
  branch: IdValue | null;
  warehouse: IdValue | null;
  requisitionFrom: EmployeeCache | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
  approvedBy: EmployeeCache | null;
  rejectBy: EmployeeCache | null;
  acknowledgementBy: EmployeeCache | null;

  branchRequisitionDetails: BranchRequisitionDetailDTO[];
}

export interface BranchRequisitionDetailDTO
  extends Omit<BranchRequisitionDetails, "createdBy" | "updatedBy"> {
  item: ItemMasterToDto | null;
  warehouseInHandStock: number | null;
  branchInHandStock: number | null;
  availableQtyToReturn?: number | null;
  createdBy?: EmployeeCache | null;
  updatedBy?: EmployeeCache | null;
}

export interface RejectBranchRequisitionInput {
  id: number;
  ccId: number;
  inHandQty?: number;
}

export interface ApproveBranchReqInput {
  branchReqId: number;
  brNumber: string;

  ccId: number;

  assignItems: AssignBranchItem[];

  branchReqStatus?: STORE_REQ_STATUS;

  branchReqAckStatus?: STORE_REQ_ACK_STATUS;

  branchReq?: ValBranchRequisitionResponse;
}

export interface AssignBranchItem {
  branchRequisitionDetailsId: number;
  itemId: number;
  itemStockId: number;

  assignedQty: number;
  batchNo?: string;
  isFoc: boolean;
  expiryDate?: string;

  isBatch: boolean;
  isExpiry: boolean;
}

export interface AcknowledgeBranchRequisition {
  branchReqId: number;
  brNumber: string;

  branchId: number;

  acknowledgeItems: AcknowledgeBranchItem[];

  branchReqAckStatus?: STORE_REQ_ACK_STATUS;

  branchReq?: ValBranchRequisitionResponse;
}

export interface AcknowledgeBranchItem {
  branchRequisitionDetailsId: number;
  itemId: number;
  totalAcknowledgeQty: number;
  itemBatch: BranchItemBatch[];
}

export interface BranchItemBatch {
  branchItemId: number;
  acknowledgeQty: number;
  batchNo?: string;
  expiryDate?: string;
  isFoc: boolean;
  isCompleted?: boolean;
  isBatch: boolean;
  isExpiry: boolean;
}

export type BranchItemDetailResponse = Prisma.BranchItemDetailsGetPayload<{
  include: {
    branchRequisitionDetails: true;
  };
}>;

export interface BranchItemDetailDTO
  extends Omit<BranchItemDetailResponse, "branchRequisitionDetails"> {
  branchRequisitionDetails: BranchRequisitionDetailDTO;
}

export type BranchReqBatchWiseResponse = Prisma.BranchRequisitionGetPayload<{
  include: {
    branchItemDetails: {
      where: {
        isActive: true;
        isCompleted: false;
      };
      include: {
        branchRequisitionDetails: true;
      };
    };
  };
}>;

export interface BranchRequisitionBatchWiseDTO
  extends Omit<
    BranchReqBatchWiseResponse,
    | BaseModelAttrWoCancel
    | "ccId"
    | "branchId"
    | "requisitionFrom"
    | "branchItemDetails"
  > {
  warehouse: IdValue | null;
  branch: IdValue | null;
  requisitionFrom: IdValue | null;
  branchItemDetails: BranchItemDetailDTO[];
}

export interface BrDetailDTO
  extends Omit<BranchRequisitionDetails, "itemId" | "createdBy" | "updatedBy"> {
  item: ItemMasterToDto | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
}
