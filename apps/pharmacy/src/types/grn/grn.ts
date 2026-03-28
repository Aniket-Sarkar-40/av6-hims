import {
  DiscMethod,
  Distributor,
  PmsGoodReceiveDetails,
  GRN_STATUS,
  PAYMENT_STATUS,
  PO_STATUS,
  Prisma,
  TAX_METHOD,
  PmsItem,
  PmsWarehouse,
} from "@repo/db/generated/prisma/client";
import { WarehouseDTO } from "../master/warehouse.js";
import { EmployeeCache } from "../staff/employee.js";
import { DecimalToNumber } from "@repo/platform/types/common.js";

export interface CreateGrnInput {
  id?: number;
  poNumber: string;
  poId: number;
  date: Date;
  distributorId: number;
  warehouseId: number;
  totalAmount: number;
  discountMethod: DiscMethod;
  netDiscount: number;
  netTotal: number;
  dueDate: Date;
  netTax: number;
  gatePassId: number;
  discount?: number;
  paidAmount?: number;
  notes?: string | null;
  paymentStatus?: PAYMENT_STATUS;
  status?: GRN_STATUS;
  billNo?: string | null;
  billDate?: Date | null;
  tax?: number;
  shipping?: number;
  returnedAmount?: number;
  margin?: number;
  poStatus?: PO_STATUS;
  goodReceiveDetails: GrnDetailInput[];

  distributor: Distributor | null;
}

export interface GrnDetailInput {
  id?: number;
  itemId: number;
  poDetailsId: number;
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
  purchasedPrice: number;
  focQuantity: number;
  netTax: number;
  taxMethod: TAX_METHOD;
  batchNo: string;
  totalAmount: number;
  netAmount: number;
  discountMethod: DiscMethod;
  itemCategoryId?: number | null;
  mrp?: number | null;
  tax?: number;
  expiryDate?: Date | null;
  quantity: number;
  orderQuantity?: number;
  discount: number;
  netDiscount: number;
}

export interface GrnDTO extends Omit<
  GrnResponse,
  "createdBy" | "goodReceiveDetails"
> {
  distributor: Distributor | null;
  warehouse: WarehouseDTO | null;
  createdBy: EmployeeCache | null;
  goodReceiveDetails: GrnDetailDTO[];
}

export interface GrnDetailDTO extends PmsGoodReceiveDetails {
  item: DecimalToNumber<PmsItem> | null;
  inHandQty: number | null;
}

export type GrnResponse = Prisma.PmsGoodReceiveGetPayload<{
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
    gatePass: true;
  };
}>;

export type GrnDetailsResponseBase = Prisma.PmsGoodReceiveDetailsGetPayload<{
  include: {
    goodReceive: true;
  };
}>;

export interface GrnDetailsResponse extends Omit<
  GrnDetailsResponseBase,
  "createdBy"
> {
  item: DecimalToNumber<PmsItem> | null;
  billTo: string | null;
  warehouse: PmsWarehouse | null;
  createdBy: EmployeeCache | null;
}

export interface GrnReqExcelFilter {
  id?: number;
  poNumber?: string;
  startDate?: Date;
  endDate?: Date;
  warehouseId?: number;
  distributorId?: number;
  status?: GRN_STATUS;
  paymentStatus?: PAYMENT_STATUS;
  poStatus?: PO_STATUS;
  gatePassId?: number;
}
