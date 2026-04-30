import {
  DiscMethod,
  Distributor,
  PmsGoodReceiveReturnDetails,
  PAYMENT_STATUS,
  Prisma,
  RETURN_STS,
  TAX_METHOD,
  PmsWarehouse,
  PmsItem,
} from "@repo/db/generated/prisma/client";
import { EmployeeCache } from "../staff/employee.js";
import { DecimalToNumber } from "@repo/platform/types/common.js";

export interface CreateGrnReturnInput {
  id?: number;
  grnId: number;
  poNumber: string;
  grnNumber: string;
  poId: number;
  date: Date;
  distributorId: number;
  warehouseId: number;
  ccId: number;
  totalAmount: number;
  discount?: number;
  netDiscount?: number;
  discountMethod: DiscMethod;
  netTotal: number;
  paidAmount?: number;
  notes?: string | null;
  paymentStatus?: PAYMENT_STATUS;
  status?: RETURN_STS;
  billNo?: string | null;
  billDate?: Date | null;
  dueDate: Date;
  tax?: number;
  netTax: number;
  shipping?: number;
  creditNoteType: string;
  creditNoteNo: number;
  approvedBy: string;
  isApproval?: boolean;
  goodReceiveReturnDetails: CreateGrnReturnDetailsInput[];

  distributor: Distributor | null;

  grnReturn: GoodReceivedReturnResponse;
}

export type GoodReceivedReturnResponse = Prisma.PmsGoodReceiveReturnGetPayload<{
  include: {
    goodReceiveReturnDetails: {
      where: { isActive: true };
    };
  };
}>;

export interface CreateGrnReturnDetailsInput {
  id?: number;
  itemId: number;
  itemCategoryId?: number;
  itemMedCategory: string;
  grnDetailsId: number;
  batchNo: string;
  expiryDate?: Date | null;
  quantity: number;
  purchasedPrice: number;
  totalAmount: number;
  tax?: number;
  netTax: number;
  taxMethod: TAX_METHOD;
  netAmount: number;
  discountMethod: DiscMethod;
  discount?: number;
  netDiscount: number;
  orderQty: number;
  grnQty: number;
  inHandQty: number;
}

export interface GoodReceiveReturnDTO
  extends Omit<
    GrnReturnResponse,
    "createdBy" | "goodReceiveReturnDetails" | "rejectedBy" | "approvedBy"
  > {
  goodReceiveReturnDetails: GoodReceiveReturnDetailDTO[];
  distributor: Distributor | null;
  warehouse: PmsWarehouse | null;
  createdBy: EmployeeCache | null;
  approvedBy: EmployeeCache | null;
  rejectedBy: EmployeeCache | null;
}

export interface GoodReceiveReturnDetailDTO
  extends PmsGoodReceiveReturnDetails {
  inHandQty: number | null;
  returnedQty: number | null;
  item: DecimalToNumber<PmsItem> | null;
}

export type GrnReturnResponse = Prisma.PmsGoodReceiveReturnGetPayload<{
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

export type GrnReturnDetailsResponseBase =
  Prisma.PmsGoodReceiveReturnDetailsGetPayload<{
    include: {
      goodReceiveReturn: true;
      // {
      //   include: {
      //     grn: {
      //       include: {
      //         gatePass: true;
      //       };
      //     };
      //   };
      // };
    };
  }>;

export interface GrnReturnDetailsResponse
  extends Omit<GrnReturnDetailsResponseBase, "createdBy"> {
  item: DecimalToNumber<PmsItem> | null;
  billTo: string | null;
  warehouse: PmsWarehouse | null;
  createdBy: EmployeeCache | null;
  approvedBy: EmployeeCache | null;
}
