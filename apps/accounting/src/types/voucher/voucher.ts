import {
  BillAllocation,
  CompanyFinancialYear,
  ConfigSubRefType,
  CostCenterAllocation,
  Prisma,
  VoucherLine,
  VoucherReferenceType,
} from "@repo/db/generated/prisma/client";
import {
  BaseModelAttrWoCancel,
  BaseModelAttrWoCancelAndCreated,
} from "../common.js";
import { IdValue } from "../global.js";
import { CreateOrUpdateBillAllocationInput } from "./billAllocation.js";
import { CreateOrUpdateCostCenterAllocationInput } from "./costCenterAllocation.js";

export type CreateOrUpdateVoucherLineInput = Omit<
  Prisma.VoucherLineCreateManyInput,
  BaseModelAttrWoCancel | "voucherId"
>;

type VoucherInput = Omit<
  Prisma.VoucherCreateManyInput,
  BaseModelAttrWoCancelAndCreated
>;

export interface PostVoucherBillAllocationInput
  extends Omit<
    CreateOrUpdateBillAllocationInput,
    "id" | "companyId" | "financialYearId" | "voucherId" | "voucherLineId"
  > {
  lineNo: number;
}

export interface PostVoucherCostCenterAllocationInput
  extends Omit<
    CreateOrUpdateCostCenterAllocationInput,
    "companyId" | "voucherId" | "voucherLineId"
  > {
  lineNo: number;
}
export interface CreateOrUpdateVoucherInput extends VoucherInput {
  voucherLines: CreateOrUpdateVoucherLineInput[];
  billAllocations?: PostVoucherBillAllocationInput[];
  costCenterAllocations?: PostVoucherCostCenterAllocationInput[];
  existing: VoucherResponse;
}

export type VoucherResponse = Prisma.VoucherGetPayload<{
  include: {
    voucherLines: {
      where: {
        isActive: true;
      };
    };
  };
}>;

export type VoucherResponseForDTO = Prisma.VoucherGetPayload<{
  include: {
    company: true;
    financialYear: true;
    voucherLines: {
      where: {
        isActive: true;
      };
    };
    costCenterAllocations: {
      where: {
        isActive: true;
      };
    };
    billAllocations: {
      where: {
        isActive: true;
      };
    };
  };
}>;

export interface VoucherLineDTO
  extends Omit<VoucherLine, BaseModelAttrWoCancel | "ledgerId"> {
  ledger: IdValue | null;
}

export interface BillAllocationDTO
  extends Omit<
    BillAllocation,
    BaseModelAttrWoCancel | "companyId" | "partyLedgerId" | "financialYearId"
  > {
  partyLedger: IdValue | null;
}
export interface CostCenterAllocationDTO
  extends Omit<
    CostCenterAllocation,
    BaseModelAttrWoCancel | "companyId" | "costCenterId"
  > {
  costCenter: IdValue | null;
}
export interface VoucherDTO
  extends Omit<
    VoucherResponseForDTO,
    | BaseModelAttrWoCancelAndCreated
    | "company"
    | "voucherLines"
    | "financialYear"
    | "companyId"
    | "ccId"
    | "voucherTypeId"
    | "financialYearId"
    | "costCenterAllocations"
    | "billAllocations"
    | "createdBy"
    | "approvedBy"
    | "currencyId"
  > {
  createdBy: IdValue | null;
  approvedBy: IdValue | null;
  company: IdValue | null;
  financialYear: Omit<CompanyFinancialYear, BaseModelAttrWoCancel>;
  collectionCenter: IdValue | null;
  voucherType: IdValue | null;
  voucherLines: VoucherLineDTO[];
  billAllocations: BillAllocationDTO[];
  costCenterAllocations: CostCenterAllocationDTO[];
  currency: IdValue | null;
}

/** Type for integrating with external systems */
export enum PaymentMode {
  CASH = "CASH",
  BANK = "BANK",
}

export type paymentInput = {
  paymentMode: PaymentMode;
  accountName: string;
  paymentAmount: number;
};

export type ExternalPostVoucherInput = {
  ccId: number;
  refType: VoucherReferenceType;
  refSubType?: ConfigSubRefType;
  refNo: string;
  refId: number;
  refDate: Date;
  pId?: string;
  totalAmount: number;
  clientId?: number;
  clientPayAmount: number;
  customerName?: string;
  customerPayAmount: number;
  createdBy: number;
  payments?: paymentInput[];
};

export interface preparedVoucherInput
  extends Omit<
    CreateOrUpdateVoucherInput,
    "existing" | "billAllocations" | "costCenterAllocations" | "voucherNo"
  > {
  createdBy?: number;
}
export type IntegrationConfigKeys = Pick<
  ExternalPostVoucherInput,
  | "totalAmount"
  | "clientId"
  | "clientPayAmount"
  | "customerName"
  | "customerPayAmount"
  | "payments"
> &
  Pick<paymentInput, "accountName" | "paymentAmount">;

export const IntegrationConfigKeysKeys: (keyof IntegrationConfigKeys)[] = [
  "totalAmount",
  "clientId",
  "clientPayAmount",
  "customerName",
  "customerPayAmount",
  "payments",
  "accountName",
  "paymentAmount",
];

export type preparedVoucherInputFromExcel = Omit<
  CreateOrUpdateVoucherInput,
  "existing" | "billAllocations" | "costCenterAllocations" | "voucherNo"
>;
