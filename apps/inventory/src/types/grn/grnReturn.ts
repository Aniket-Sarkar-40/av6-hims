import { ItemMasterToDto } from "@/types/grn/grn.js";
import { ItemSupplierDTO } from "@/types/master/itemSupplier.js";
import { EmployeeCache } from "@apps/core/types/staff/employee.js";
import {
  InvGoodReceiveReturnDetails,
  InvItem,
  PAYMENT_STATUS,
  Prisma,
  RETURN_STS,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";
import { BaseModelAttr } from "@repo/shared/types/global.js";

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
  location: IdValue | null;
  createdBy: EmployeeCache | null;
  approvedBy: EmployeeCache | null;
  rejectedBy: EmployeeCache | null;
}

export interface GrnReturnDetailDTO
  extends Omit<
    InvGoodReceiveReturnDetails,
    "itemId" | "createdBy" | "updatedBy"
  > {
  item: ItemMasterToDto | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
}
export interface GoodReceiveReturnDetailDTO
  extends Omit<InvGoodReceiveReturnDetails, "createdBy" | "updatedBy"> {
  inHandQty: number | null;
  returnedQty: number | null;
  availableTotalQtyToReturn: number | null;
  item: InvItem | null;
  purchasePrice: number | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
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
