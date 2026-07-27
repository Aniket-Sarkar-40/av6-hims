import {
  Prisma,
  STORE_REQ_ACK_STATUS,
  STORE_REQ_STATUS,
} from "@repo/db/generated/prisma/client";
import {
  BaseModelAttr,
  BaseModelAttrWoCancel,
  IdValue,
} from "@repo/shared/types/global.js";
import { EmployeeCache } from "av6-core-v2";
import { ItemMasterToDto } from "../grn/grn.js";

export type StoreRequisitionDetailInput =
  Prisma.InvStoreRequisitionDetailsUncheckedCreateWithoutStoreRequisitionInput & {
    branchInHandStock: number;
    warehouseInHandStock: number;
    userInHandStock: number;
  };

export type RequisitionItemDetails =
  Prisma.RequisitionInvItemDetailsUncheckedCreateWithoutStoreRequisitionInput;

export type CreateStoreRequisitionInput = Omit<
  Prisma.InvStoreRequisitionUncheckedCreateInput,
  "storeRequisitionDetails"
> & {
  storeRequisitionDetails: StoreRequisitionDetailInput[];
  storeReq: ValStoreRequisitionResponse;
};

export type BaseInclude = {
  storeRequisitionDetails: {
    where: { isActive: true };
  };
  requisitionInvItemDetails: {
    where: { isActive: true };
  };
};

export type ValStoreRequisitionResponse = Prisma.InvStoreRequisitionGetPayload<{
  include: BaseInclude;
}>;

export type StoreRequisitionResponse = Prisma.InvStoreRequisitionGetPayload<{
  include: BaseInclude;
}>;

export interface StoreRequisitionDTO extends Omit<
  ValStoreRequisitionResponse,
  | BaseModelAttrWoCancel
  | "ccId"
  | "createdBy"
  | "storeRequisitionDetails"
  | "approvedBy"
  | "rejectBy"
  | "acknowledgementBy"
  | "updatedBy"
  | "requisitionFrom"
> {
  isAnyPendingReturn: boolean;
  branch: IdValue | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
  approvedBy: EmployeeCache | null;
  rejectBy: EmployeeCache | null;
  staff: EmployeeCache | null;
  requisitionFrom: IdValue | null;
  acknowledgementBy: EmployeeCache | null;
  storeRequisitionDetails: StoreRequisitionDetailDTOBranch[];
}

export type StoreRequisitionDetails =
  Prisma.InvStoreRequisitionDetailsGetPayload<Record<string, never>>;

export interface StoreRequisitionBatchWiseDTO extends Omit<
  StoreReqBatchWiseResponse,
  "requisitionFrom" | "requisitionItemDetails"
> {
  branch: IdValue | null;
  requisitionFrom: IdValue | null;
  requisitionItemDetails: RequisitionItemDetailDTO[];
}

export interface StoreRequisitionDetailDTO extends StoreRequisitionDetails {
  item: ItemMasterToDto | null;
  warehouseInHandStock: number | null;
  branchInHandStock: number | null;
}
export interface StoreRequisitionDetailDTOBranch extends Omit<
  StoreRequisitionDetails,
  "createdBy" | "updatedBy"
> {
  item: ItemMasterToDto | null;
  warehouseInHandStock: number | null;
  branchInHandStock: number | null;
  userInHandStock: number | null;
  availableQtyToReturn: number | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
}

export interface RequisitionItemDetailDTO extends RequisitionItemDetailResponse {
  storeRequisitionDetails: StoreRequisitionDetailDTO;
  availableQtyToReturn: number;
}

export interface RejectStoreRequisitionInput {
  id: number;
  ccId: number;
  inHandQty?: number;
}

export interface ApproveStoreReqInput {
  storeReqId: number;
  storeReqNo: string;
  assignItems: AssignItem[];
  ccId: number;
  storeReqStatus?: STORE_REQ_STATUS;
  storeReqAckStatus?: STORE_REQ_ACK_STATUS;
  storeReq: ValStoreRequisitionResponse;
}

export interface AssignItem {
  storeRequisitionDetailsId: number;
  itemId: number;
  itemStockId: number;

  assignedQty: number;
  batchNo?: string;
  isFoc: boolean;
  expiryDate?: string;

  isBatch: boolean;
  isExpiry: boolean;
}

export interface AcknowledgeRequisition {
  storeReqId: number;
  storeReqNo: string;
  ccId: number;
  acknowledgeItems: AcknowledgeItem[];
  storeReqAckStatus?: STORE_REQ_ACK_STATUS;
  requisitionFrom: number;
  storeReq: ValStoreRequisitionResponse;
}

export interface AcknowledgeItem {
  storeRequisitionDetailsId: number;
  itemId: number;
  totalAcknowledgeQty: number;
  itemBatch: ItemBatch[];
}

export interface ItemBatch {
  requisitionItemId: number;
  acknowledgeQty: number;
  batchNo?: string;
  expiryDate?: string;
  isFoc: boolean;
  isCompleted?: boolean;

  isBatch: boolean;
  isExpiry: boolean;
}

export type RequisitionItemDetailResponse =
  Prisma.RequisitionInvItemDetailsGetPayload<{
    include: {
      storeRequisitionDetails: true;
    };
  }>;

export type StoreReqBatchWiseResponse = Prisma.InvStoreRequisitionGetPayload<{
  include: {
    requisitionInvItemDetails: {
      where: {
        isActive: true;
        isCompleted: false;
      };
      include: {
        storeRequisitionDetails: true;
      };
    };
  };
}>;

export type StoreReqValResponse = Prisma.InvStoreRequisitionGetPayload<{
  include: {
    requisitionInvItemDetails: {
      where: {
        isActive: true;
        isCompleted: false;
      };
    };
    storeRequisitionDetails: {
      where: {
        isActive: true;
      };
    };
  };
}>;

export interface StrDetailDTO extends Omit<
  StoreRequisitionDetails,
  "item" | BaseModelAttr | "itemId" | "createdBy" | "updatedBy"
> {
  item: ItemMasterToDto | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
}
