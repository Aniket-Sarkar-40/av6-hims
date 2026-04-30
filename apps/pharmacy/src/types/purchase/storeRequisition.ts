import {
  STORE_REQ_ACK_STATUS,
  STORE_REQ_STATUS,
} from "@repo/db/generated/prisma/enums.js";
import { BranchDTO } from "../master/branch.js";
import { WarehouseDTO } from "../master/warehouse.js";
import { EmployeeCache } from "../staff/employee.js";
import {
  MedCategory,
  PmsBranch,
  PmsItem,
  PmsStoreRequisition,
  PmsStoreRequisitionDetails,
  PmsWarehouse,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { DecimalToNumber } from "@repo/platform/types/common.js";
// CreateStoreRequisition interface
export interface CreateStoreRequisitionInput {
  id?: number;
  ccId: number;
  requisitionFrom: number;
  branchId: number;
  warehouseId: number;
  storeReqStatus?: STORE_REQ_STATUS;
  storeReqAckStatus?: STORE_REQ_ACK_STATUS;
  storeReqDetails?: string;
  storeRequisitionDetails: StoreRequisitionDetailInput[];

  storeReq: ValStoreRequisitionResponse;
}

export interface StoreRequisitionDetailInput {
  id?: number;
  itemId: number;

  itemCategoryName: string;
  medType: string;
  medComp: string;
  medUnit: string;
  manufacturer: string;
  packSize: string;
  drugType: string;

  itemCategoryId: number;
  medTypeId: number;
  medCompId: number;
  medUnitId: number;
  manufacturerId: number;
  packSizeId: number;
  drugTypeId: number;

  warehouseInHandStock: number;
  branchInHandStock: number;

  reqQuantity: number;
  comment?: string | null;
}

export interface StoreRequisitionDTO
  extends Omit<
    StoreRequisitionResponse,
    | "createdBy"
    | "storeRequisitionDetails"
    | "approvedBy"
    | "rejectBy"
    | "acknowledgementBy"
  > {
  isAnyPendingReturn: boolean;
  branch: BranchDTO | null;
  warehouse: WarehouseDTO | null;
  createdBy: EmployeeCache | null;
  approvedBy: EmployeeCache | null;
  rejectBy: EmployeeCache | null;
  acknowledgementBy: EmployeeCache | null;
  storeRequisitionDetails: StoreRequisitionDetailDTO[];
}

export interface StoreRequisitionBatchWiseDTO
  extends StoreReqBatchWiseResponse {
  branch: BranchDTO | null;
  warehouse: WarehouseDTO | null;
  requisitionItemDetails: RequisitionItemDetailDTO[];
}

export interface StoreRequisitionDetailDTO extends PmsStoreRequisitionDetails {
  item: DecimalToNumber<PmsItem> | null;
  itemCategory: MedCategory | null;
  warehouseInHandStock: number | null;
  branchInHandStock: number | null;
}

export interface RequisitionItemDetailDTO
  extends RequisitionItemDetailResponse {
  storeRequisitionDetails: StoreRequisitionDetailDTO;
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

interface AssignItem {
  storeRequisitionDetailsId: number;
  itemId: number;
  itemStockId: number;

  assignedQty: number;
  batchNo: string;
  isFoc: boolean;
  expiryDate?: string;
}

export interface AcknowledgeRequisition {
  storeReqId: number;
  storeReqNo: string;
  ccId: number;
  acknowledgeItems: AcknowledgeItem[];
  storeReqAckStatus?: STORE_REQ_ACK_STATUS;

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
  batchNo: string;
  expiryDate?: string;
  isFoc: boolean;
  isCompleted?: boolean;
}

export type StoreRequisitionResponse = Prisma.PmsStoreRequisitionGetPayload<{
  include: {
    storeRequisitionDetails: {
      where: { isActive: true };
    };
    staff: true;
  };
}>;

export type ValStoreRequisitionResponse = Prisma.PmsStoreRequisitionGetPayload<{
  include: {
    storeRequisitionDetails: {
      where: { isActive: true };
    };
  };
}>;

export type RequisitionItemDetailResponse =
  Prisma.PmsRequisitionItemDetailsGetPayload<{
    include: {
      storeRequisitionDetails: true;
    };
  }>;

export type StoreReqBatchWiseResponse = Prisma.PmsStoreRequisitionGetPayload<{
  include: {
    requisitionItemDetails: {
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

export type StoreReqValResponse = Prisma.PmsStoreRequisitionGetPayload<{
  include: {
    requisitionItemDetails: {
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

export interface StoreReqExcelFilter {
  id?: number;
  staffId?: number;
  branchId?: number;
  warehouseId?: number;
  startDate?: string;
  endDate?: string;
  storeReqStatus?: STORE_REQ_STATUS;
  storeReqAckStatus?: STORE_REQ_ACK_STATUS;
}

export interface StoreRequisitionPdfDTO
  extends Omit<
    StoreRequisitionBatchWiseDTO,
    | "requisitionFrom"
    | "createdBy"
    | "approvedBy"
    | "rejectBy"
    | "acknowledgementBy"
  > {
  requisitionFrom: EmployeeCache | null;
  createdBy: EmployeeCache | null;
  approvedBy: EmployeeCache | null;
  rejectBy: EmployeeCache | null;
  acknowledgementBy: EmployeeCache | null;
}

export type RequisitionDetailsResponseBase =
  Prisma.PmsStoreRequisitionDetailsGetPayload<{
    include: {
      storeRequisition: true;
    };
  }>;

export interface RequisitionDetailsResponse
  extends Omit<RequisitionDetailsResponseBase, "createdBy"> {
  item: DecimalToNumber<PmsItem> | null;
  acknowledgedBy: EmployeeCache | null;
  approvedBy: EmployeeCache | null;
  createdBy: EmployeeCache | null;
  warehouse: PmsWarehouse | null;
  branch: PmsBranch | null;
}

export type ReqItemDetailsResponseBase =
  Prisma.PmsRequisitionItemDetailsGetPayload<{
    include: {
      storeRequisitionDetails: true;
      storeRequisition: true;
    };
  }>;

export interface StoreReq
  extends Omit<
    PmsStoreRequisition,
    "acknowledgedBy" | "approvedBy" | "createdBy"
  > {
  acknowledgedBy: EmployeeCache | null;
  approvedBy: EmployeeCache | null;
  createdBy: EmployeeCache | null;
  warehouse: PmsWarehouse | null;
  branch: PmsBranch | null;
}

export interface ReqDetForReqItemDetails
  extends Omit<RequisitionDetailsResponseBase, "storeRequisition"> {
  item: DecimalToNumber<PmsItem> | null;
  storeRequisition: StoreReq;
}

export interface ReqItemDetailsResponse
  extends Omit<
    ReqItemDetailsResponseBase,
    "storeRequisitionDetails" | "storeRequisition"
  > {
  storeRequisitionDetails: ReqDetForReqItemDetails;
}
