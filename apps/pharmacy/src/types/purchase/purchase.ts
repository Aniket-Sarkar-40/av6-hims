import {
  Distributor,
  PmsItem,
  MedCategory,
  PO_STATUS,
  Prisma,
  PmsStorage,
  PmsWarehouse,
} from "@repo/db/generated/prisma/client";
import { WarehouseDTO } from "../master/warehouse.js";
import { EmployeeCache } from "../staff/employee.js";
import { DecimalToNumber } from "@repo/platform/types/common.js";
// CreatePurchaseOrder interface
export interface CreatePurchaseOrderInput {
  id?: number;
  poNumber?: string;
  date: Date;
  distributorId: number;
  warehouseId: number;
  grandTotal: number;
  status?: PO_STATUS;
  notes?: string | null;
  currency?: string | null;
  storageId?: number | null;
  paymentTerms?: string | null;
  purchaseOrderDetails: PurchaseOrderDetailInput[];

  distributor: Distributor | null;
  po: POResponse;
  warehouse: PmsWarehouse | null;
}

// PurchaseOrderDetails interface for create and update
export interface PurchaseOrderDetailInput {
  id?: number;
  uom?: string | null;
  // purchaseId: number;
  itemId: number;
  itemCategoryId: number;
  itemMedCategory: string;
  medType: string;
  medComp: string;
  medUnit: string;
  manufacturer: string;
  packSize: string;
  drugType: string;
  medTypeId: number;
  medCompId: number;
  medUnitId: number;
  manufacturerId: number;
  packSizeId: number;
  drugTypeId: number;
  mrp?: number | null;
  purchasedPrice: number;
  packingQty?: string | null;
  quantity: number;
  receivedQty?: number;
  totalAmount: number;
}

export type PurchaseOrderDetailsBase =
  Prisma.PmsPurchaseOrderDetailsGetPayload<{
    include: {
      purchase: true;
    };
  }>;

export interface PurchaseOrderDetailsDto
  extends Omit<PurchaseOrderDetailsBase, "createdBy"> {
  item: DecimalToNumber<PmsItem> | null;
  distributor: Distributor | null;
  warehouse: PmsWarehouse | null;
  createdBy: EmployeeCache | null;
  // approvedByL1: EmployeeCache | null;
  // approvedByL2: EmployeeCache | null;
  // approvedByL3: EmployeeCache | null;
}

export interface PurchaseOrderDTO {
  id: number;
  poNumber: string;
  date: Date;
  distributor: Distributor | null;
  warehouse: WarehouseDTO | null;
  grandTotal: number;
  status: PO_STATUS;
  notes: string | null;
  currency: string | null;
  storage: PmsStorage | null;
  paymentTerms?: string | null;
  isActive: boolean;
  createdBy: EmployeeCache | null;
  lastVerifiedBy: EmployeeCache | null;
  updatedBy: number | null;
  createdAt: Date;
  lastVerifiedAt: Date | null;
  updatedAt: Date;
  purchaseOrderDetailDTO: PurchaseOrderDetailDTO[];
}

export interface PurchaseOrderDetailDTO {
  id: number;
  uom: string | null;
  purchaseId: number;
  item: DecimalToNumber<PmsItem> | null;
  itemCategoryId: number | null;
  itemCategory: MedCategory | null;
  itemMedCategory: string;
  medType: string;
  medComp: string;
  medUnit: string;
  manufacturer: string;
  packSize: string;
  drugType: string;
  medTypeId: number;
  medCompId: number;
  medUnitId: number;
  manufacturerId: number;
  packSizeId: number;
  drugTypeId: number;
  mrp: number | null;
  purchasedPrice: number;
  packingQty: string | null;
  quantity: number;
  receivedQty: number | null;
  totalAmount: number;
  isActive: boolean;
  createdBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// export interface PurchaseOrderApprovalInput {
//   verifiedBy1?: number;
//   verifiedAt1?: Date;
//   verifiedBy2?: number;
//   verifiedAt2?: Date;
// }

export interface PurchaseReqExcelFilter {
  id?: number;
  poNumber?: string;
  startDate?: Date;
  endDate?: Date;
  warehouseId?: number;
  distributorId?: number;
  storageId?: number;
  status?: PO_STATUS;
}

export type POResponse = Prisma.PmsPurchaseOrderGetPayload<{
  include: {
    purchaseOrderDetails: {
      where: { isActive: true };
    };
  };
}>;
