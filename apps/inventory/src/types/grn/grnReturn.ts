import {
  InvGoodReceiveReturnDetails,
  InvItem,
  PAYMENT_STATUS,
  Prisma,
  RETURN_STS,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttr, IdValue } from "@repo/shared/types/global.js";
import { EmployeeCache } from "av6-core-v2";
import { ItemSupplierDTO } from "../master/itemSupplier.js";

export interface GrnReturnDetailInput
  extends Prisma.InvGoodReceiveReturnDetailsUncheckedCreateWithoutGoodReceiveReturnInput {
  inHandQty: number;
  purchasedPrice: number;
  isBatch: boolean;
  isExpiry: boolean;
  focQuantity?: number;
  stockQuantity?: number;
}

export interface CreateGrnReturnInput
  extends Omit<
    Prisma.InvGoodReceiveReturnUncheckedCreateInput,
    "goodReceiveReturnDetails" | BaseModelAttr
  > {
  goodReceiveReturnDetails: GrnReturnDetailInput[];
  grnReturn: GoodReceivedReturnResponse;
  supplier: ItemSupplierDTO;
  isApproval?: boolean;
}

export type GoodReceivedReturnResponse = Prisma.InvGoodReceiveReturnGetPayload<{
  include: {
    goodReceiveReturnDetails: {
      where: { isActive: true };
    };
  };
}>;

export interface GoodReceiveReturnDTO
  extends Omit<
    GrnReturnResponse,
    | BaseModelAttr
    | "createdBy"
    | "goodReceiveReturnDetails"
    | "rejectedBy"
    | "approvedBy"
    | "grnId"
    | "poId"
    | "ccId"
    | "supplierId"
    | "currencyId"
  > {
  goodReceiveReturnDetails: GoodReceiveReturnDetailDTO[];
  supplier: IdValue | null;
  currency: IdValue | null;
  branch: IdValue | null;
  warehouse: IdValue | null;
  createdBy: EmployeeCache | null;
  approvedBy: EmployeeCache | null;
  rejectedBy: EmployeeCache | null;
}

export interface GoodReceiveReturnDetailDTO
  extends InvGoodReceiveReturnDetails {
  inHandQty: number | null;
  returnedQty: number | null;
  item: InvItem | null;
  purchasePrice: number | null;
}

export type GrnReturnResponse = Prisma.InvGoodReceiveReturnGetPayload<{
  include: {
    goodReceiveReturnDetails: {
      where: { isActive: true };
    };
  };
}>;

export interface GrnReturnReqExcelFilter {
  id?: number;
  grnId: number;
  grnNumber: string;
  poNumber?: string;
  startDate?: Date;
  endDate?: Date;
  warehouseId?: number;
  distributorId?: number;
  status?: RETURN_STS;
  paymentStatus?: PAYMENT_STATUS;
}
