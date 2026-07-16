import {
  AccountingNature,
  BillAllocation,
  Company,
  CompanyFinancialYear,
  ConfigSubRefType,
  CostCenterAllocation,
  Prisma,
  VoucherLine,
  VoucherReferenceType,
  VoucherTypeNature,
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
  usedChequeMasterId?: number;
  lineNo?: number; // for multi voucher
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

export type LedgerResponseForVoucherDTO = {
  id: number;
  value: string;
  groupName: string | null;
  nature: AccountingNature | null;
  isBankAccount: boolean;
  isCashAccount: boolean;
};

export interface VoucherLineDTO
  extends Omit<VoucherLine, BaseModelAttrWoCancel | "ledgerId"> {
  ledger: LedgerResponseForVoucherDTO | null;
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
  company: Pick<Company, "id" | "name" | "currencyId"> | null;
  financialYear: Omit<CompanyFinancialYear, BaseModelAttrWoCancel>;
  collectionCenter: IdValue | null;
  voucherType: VoucherTypeForDTO | null;
  voucherLines: VoucherLineDTO[];
  billAllocations: BillAllocationDTO[];
  costCenterAllocations: CostCenterAllocationDTO[];
  currency: IdValue | null;
}

export type VoucherTypeForDTO = {
  id: number;
  value: string;
  nature: VoucherTypeNature;
};
/** Type for integrating with external systems */
export enum PaymentMode {
  CASH = "CASH",
  BANK = "BANK",
}

export type paymentInput = {
  paymentMode: PaymentMode;
  bankOrCashId: number;
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
  currencyId?: number;
  currencyConversionRate?: number;
  totalAmount: number;
  clientId?: number;
  clientPayAmount: number;
  customerName?: string;
  customerPayAmount: number;
  createdBy: number;
  remarks?: string;
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
  | "remarks"
> &
  Pick<paymentInput, "bankOrCashId" | "paymentAmount">;

export const IntegrationConfigKeysKeys: (keyof IntegrationConfigKeys)[] = [
  "totalAmount",
  "clientId",
  "clientPayAmount",
  "customerName",
  "customerPayAmount",
  "payments",
  "bankOrCashId",
  "paymentAmount",
  "remarks",
];

export type preparedVoucherInputFromExcel = Omit<
  CreateOrUpdateVoucherInput,
  "existing" | "billAllocations" | "costCenterAllocations" | "voucherNo"
>;

/** Excel export types */

export type HeaderAttribute = {
  text: string;
  color?: string;
  enumValues?: string[];
};

export enum VoucherStatusForExcel {
  DRAFT = "DRAFT",
  POSTED = "POSTED",
}

/**
 * Voucher Audit Types
 */

export type CreateVoucherAuditInput = Omit<
  Prisma.VoucherAuditUncheckedCreateInput,
  BaseModelAttrWoCancelAndCreated | "id" | "approvedAt" | "approvedBy"
>;

/**
 * used cheque no DTO type
 */

export type UsedChequeNumberResponse = Prisma.UsedChequeNumberGetPayload<{
  include: {
    voucherLine: {
      include: {
        voucher: true;
      };
    };
  };
}>;

export type UsedChequeNumberDTO = {
  id: number;
  chequeNo: string;
  isUsed: boolean;
  voucherId: number;
  voucherLineId: number;
  voucherNo: string;
  voucherDate: Date;
  voucherType: IdValue | null;
};

export type topLedgerData = {
  name: string;
  label: string;
  amount: number;
};

/* voucher pdf dto type */

export interface VoucherPdfDTO
  extends Omit<
    VoucherDTO,
    "voucherLines" | "costCenterAllocations" | "billAllocations"
  > {
  amountInWords: string;
  transactionType: string | null;
  instrumentNo: string | null;
  instrumentDate: Date | null;
  topLedger: topLedgerData | null;
  voucherLines: VoucherLinePdfDTO[];
}

export interface VoucherLinePdfDTO extends VoucherLineDTO {
  index: number;
}
