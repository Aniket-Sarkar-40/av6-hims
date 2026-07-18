import { ItemSupplierDTO } from "@/types/master/itemSupplier.js";
import { EmployeeCache } from "@apps/core/types/staff/employee.js";
import {
  InvBranch,
  InvGoodReceiveDetails,
  InvItem,
  InvItemSupplier,
  InvUnitMaster,
  InvWarehouse,
  PO_STATUS,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";
import { BaseModelAttr } from "@repo/shared/types/global.js";

export interface GrnDetailInput
  extends Prisma.InvGoodReceiveDetailsUncheckedCreateWithoutGoodReceiveInput {
  poDetailsId: number;
  isBatch: boolean;
  isExpiry: boolean;

  stockQuantity?: number;
  stockFocQuantity?: number;
}

export type CreateGrnInput = Omit<
  Prisma.InvGoodReceiveUncheckedCreateInput,
  | "grnNumber"
  | "goodReceiveDetails"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "isActive"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
> & {
  poStatus?: PO_STATUS;
  goodReceiveDetails: GrnDetailInput[];
  supplier: ItemSupplierDTO;
};

export interface GrnDTO extends Omit<
  GrnResponse,
  | BaseModelAttr
  | "goodReceiveDetails"
  | "supplierId"
  | "poId"
  | "ccId"
  | "storeId"
  | "currencyId"
> {
  currency: IdValue | null;
  supplier: IdValue | null;
  warehouse: IdValue | null;
  branch: IdValue | null;
  location: IdValue | null;
  createdBy: EmployeeCache | null;
  goodReceiveDetails: GrnDetailDTO[];
}

export interface GoodReceiveDetailPdfDTO extends Omit<
  InvGoodReceiveDetails,
  "itemId"
> {
  item: InvItem | null;
}
export interface GoodReceiveDetailDTO extends Omit<
  InvGoodReceiveDetails,
  "itemId" | "createdBy" | "updatedBy"
> {
  item: ItemMasterToDto | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
}
export interface GrnDetailDTO extends Omit<
  InvGoodReceiveDetails,
  "createdBy" | "updatedBy"
> {
  item: ItemMasterToDto | null;
  inHandQty: number | null;
  grnQty: number | null;
  totalGrnQty: number | null;
  alreadyReturnedQty: number | null;
  grnRemainingQty: number | null;
  stockQtyForReturn: number | null;
  availableTotalQtyToReturn: number | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
}

export interface ItemMasterToDto extends InvItem {
  itemCategory: IdValue | null;
  unitMaster: InvUnitMaster | null;
}

export type GrnResponse = Prisma.InvGoodReceiveGetPayload<{
  include: {
    goodReceiveDetails: {
      where: { isActive: true };
      include: {
        item: {
          include: {
            unit: true;
          };
        };
      };
    };
    po: {
      select: {
        id: true;
        date: true;
        lastVerifiedBy: true;
        lastVerifiedAt: true;
        createdBy: true;
        status: true;
        currency: true;
        grandTotal: true;
      };
    };
  };
}>;

// export interface GrnReqExcelFilter {
//   id?: number;
//   poNumber?: string;
//   startDate?: Date;
//   endDate?: Date;
//   warehouseId?: number;
//   distributorId?: number;
//   status?: GRN_STATUS;
//   paymentStatus?: PAYMENT_STATUS;
//   poStatus?: PO_STATUS;
//   gatePassId?: number;
// }

export interface ItemCommon {
  id: number;
  item: string;
  itemCode: string | null;
  itemDescription: string;
  reOrderLevel: number | null;
  unitMaster: number;
  itemCategory: number;
}

export interface GoodReceiveDetailDTO extends Omit<
  InvGoodReceiveDetails,
  "itemId" | "createdBy" | "updatedBy"
> {
  item: ItemMasterToDto | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
}

export interface GrnPdfDTO extends Omit<
  GrnDTO,
  | "warehouse"
  | "branch"
  | "location"
  | "supplier"
  | "date"
  | "goodReceiveDetails"
> {
  cc: InvBranch | InvWarehouse | null;
  supplier: InvItemSupplier | null;
  date: string;

  amountInWords: string;
  goodReceiveDetails: GoodReceiveDetailPdfDTO[];
}

export interface GoodReceiveDetailPdfDTO extends Omit<
  InvGoodReceiveDetails,
  "itemId"
> {
  item: InvItem | null;
}
