import {
  InvGoodReceiveDetails,
  InvItem,
  InvUnitMaster,
  PO_STATUS,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttr, IdValue } from "@repo/shared/types/global.js";
import { EmployeeCache } from "av6-core-v2";
import { ItemSupplierDTO } from "../master/itemSupplier.js";

export interface GrnDetailInput
  extends Prisma.InvGoodReceiveDetailsUncheckedCreateWithoutGoodReceiveInput {
  poDetailsId: number;
  isBatch: boolean;
  isExpiry: boolean;
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

export interface GrnDTO
  extends Omit<
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
  createdBy: EmployeeCache | null;
  goodReceiveDetails: GrnDetailDTO[];
}

export interface GrnDetailDTO extends InvGoodReceiveDetails {
  item: ItemMasterToDto | null;
  inHandQty: number | null;
  totalGrnQty: number | null;
}

export interface ItemMasterToDto extends InvItem {
  itemCategory: IdValue | null;
  unitMaster: InvUnitMaster | null;
}

export type GrnResponse = Prisma.InvGoodReceiveGetPayload<{
  include: {
    goodReceiveDetails: {
      where: { isActive: true };
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
