import {
  InvBranch,
  InvItemSupplier,
  InvWarehouse,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttr, IdValue } from "@repo/shared/types/global.js";
import { EmployeeCache } from "av6-core-v2";
import { ItemMasterToDto } from "../grn/grn.js";
import { ItemSupplierDTO } from "../master/itemSupplier.js";

export type PurchaseOrderDetails =
  Prisma.InvPurchaseOrderDetailsUncheckedCreateWithoutPurchaseInput;

export type CreatePurchaseOrderInput = Omit<
  Prisma.InvPurchaseOrderUncheckedCreateInput,
  "id" | "purchaseOrderDetails"
> & {
  supplier: ItemSupplierDTO | null;
  purchaseOrderDetails: PurchaseOrderDetails[];
  po: PurchaseOrderDTO;
};

export interface UpdatePurchaseOrder extends CreatePurchaseOrderInput {
  id: number;
}

export interface PurchaseOrderDTO extends Omit<
  POResponse,
  | "supplier"
  | "store"
  | "purchaseOrderDetails"
  | BaseModelAttr
  | "storeId"
  | "supplierId"
  | "warehouseId"
  | "currencyId"
  | "lastVerifiedBy"
> {
  supplier: IdValue | null;
  store: IdValue | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
  warehouse: IdValue | null;
  branch: IdValue | null;
  location: IdValue | null;
  currency: IdValue | null;
  purchaseOrderDetails: PurchaseOrderDetailDTO[];
  lastVerifiedBy: EmployeeCache | null;
}

export interface PurchaseOrderDetailDTO extends Omit<
  PurchaseOrderDetailResponse,
  | "item"
  | "itemCategory"
  | BaseModelAttr
  | "itemId"
  | "itemCategoryId"
  | "medUnitId"
  | "itemMedUnit"
  | "createdBy"
  | "updatedBy"
> {
  id: number;
  item: ItemMasterToDto | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
}

export type POResponse = Prisma.InvPurchaseOrderGetPayload<{
  include: {
    supplier: true;
    store: true;
    purchaseOrderDetails: {
      where: { isActive: true };
    };
  };
}>;

export type PurchaseOrderDetailResponse =
  Prisma.InvPurchaseOrderDetailsGetPayload<{
    include: {
      item: true;
    };
  }>;

export type PurchaseOrderWithDetails = Prisma.InvPurchaseOrderGetPayload<{
  include: {
    purchaseOrderDetails: {
      include: {
        item: {
          include: {
            itemCategory: true;
            unit: true;
          };
        };
      };
    };
  };
}>;

export interface PurchaseOrderPdfDTO extends Omit<
  POResponse,
  | "supplier"
  | "store"
  | "purchaseOrderDetails"
  | BaseModelAttr
  | "storeId"
  | "supplierId"
  | "warehouseId"
  | "date"
> {
  date: string;
  supplier: InvItemSupplier | null;
  store: IdValue | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;

  cc: InvBranch | InvWarehouse | null;
  purchaseOrderDetails: PurchaseOrderDetailDTO[];
}
