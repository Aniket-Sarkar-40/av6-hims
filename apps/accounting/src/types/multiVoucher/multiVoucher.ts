import {
  CompanyFinancialYear,
  MultiVoucherDetails,
  Prisma,
} from "@repo/db/generated/prisma/client";
import {
  BaseModelAttrWoCancel,
  BaseModelAttrWoCancelAndCreated,
} from "../common.js";
import { IdValue } from "../global.js";
import { CreateOrUpdateVoucherInput } from "../voucher/voucher.js";

export type CreateOrUpdateMultiVoucherDetailsInput = Omit<
  Prisma.MultiVoucherDetailsUncheckedCreateInput,
  BaseModelAttrWoCancel | "multiVoucherId"
>;
export interface CreateOrUpdateMultiVoucherInput extends Omit<
  Prisma.MultiVoucherCreateManyInput,
  BaseModelAttrWoCancel
> {
  multiVoucherDetails: CreateOrUpdateMultiVoucherDetailsInput[];
  existing: MultiVoucherResponse;
}

export type MultiVoucherResponse = Prisma.MultiVoucherGetPayload<{
  include: {
    multiVoucherDetails: {
      where: {
        isActive: true;
      };
    };
  };
}>;

export interface MultiVoucherDetailsDTO extends Omit<
  MultiVoucherDetails,
  BaseModelAttrWoCancel | "ccId" | "ledgerId"
> {
  collectionCenter: IdValue | null;
  ledger: IdValue | null;
}

export type MultiVoucherResponseForDTO = Prisma.MultiVoucherGetPayload<{
  include: {
    company: true;
    financialYear: true;
    multiVoucherDetails: {
      where: {
        isActive: true;
      };
    };
  };
}>;

export interface MultiVoucherDTO extends Omit<
  MultiVoucherResponseForDTO,
  | BaseModelAttrWoCancelAndCreated
  | "ccId"
  | "companyId"
  | "financialYearId"
  | "voucherTypeId"
  | "ledgerId"
  | "multiVoucherDetails"
  | "company"
  | "financialYear"
  | "createdBy"
  | "approvedBy"
> {
  createdBy: IdValue | null;
  approvedBy: IdValue | null;
  collectionCenter: IdValue | null;
  company: IdValue | null;
  financialYear: Omit<CompanyFinancialYear, BaseModelAttrWoCancel>;
  voucherType: IdValue | null;
  ledger: IdValue | null;
  multiVoucherDetails: MultiVoucherDetailsDTO[];
}

export interface PreparedVoucherInputForMultiVoucher extends Omit<
  CreateOrUpdateVoucherInput,
  "existing" | "billAllocations" | "costCenterAllocations" | "voucherNo"
> {
  lineNo: number;
}

export interface MultiVoucherPdfDTO extends MultiVoucherDTO {
  amountInWords: string;
}

export interface MultiVoucherDetailsPdfDTO extends MultiVoucherDetailsDTO {
  index: number;
}
