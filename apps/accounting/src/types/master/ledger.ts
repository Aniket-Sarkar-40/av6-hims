import { BaseModelAttrWoCancel } from "@/types/common.js";
import { IdValue } from "../global.js";
import { ClientType, Ledger, Prisma } from "@repo/db/generated/prisma/client";

export type CreateOrUpdateLedgerOpeningBalanceInput = Omit<
  Prisma.LedgerOpeningBalanceUncheckedCreateInput,
  BaseModelAttrWoCancel | "ledgerId" | "companyId"
>;
export type CreateOrUpdateLedger = Omit<
  Prisma.LedgerCreateManyInput,
  BaseModelAttrWoCancel
>;

export interface CreateOrUpdateLedgerInput extends CreateOrUpdateLedger {
  ledgerOpeningBalance?: CreateOrUpdateLedgerOpeningBalanceInput;
}

export type LedgerResponse = Prisma.LedgerGetPayload<{
  include: {
    company: true;
    ledgerOpeningBalances: {
      where: {
        isActive: true;
      };
    };
  };
}>;

export interface LedgerDTO
  extends Omit<
    LedgerResponse,
    BaseModelAttrWoCancel | "company" | "companyId" | "groupId" | "currencyId"
  > {
  company: IdValue | null;
  group: IdValue | null;
  currency: IdValue | null;
}

export interface LedgerDTOForTrialBalance
  extends Omit<Ledger, BaseModelAttrWoCancel | "companyId" | "groupId"> {
  group: IdValue | null;
  parentGroup: IdValue | null;
}

export type FetchLedgerForExternalMappingInput = {
  clientType: ClientType;
};

export type LedgerExcelBaseInput = {
  companyId: number;
};

export type LedgerExcelRow = {
  Name: string;
  "Group Name": string;
  Alias?: string;
  "Ledger Type"?: string;
  "Bank Account"?: string;
  "Cash Account"?: string;
  "Bank Name"?: string;
  "Bank IFSC"?: string;
  "Bank Account No"?: string;
  "UPI Id"?: string;
  "Contact Name"?: string;
  Phone?: string;
  Email?: string;
  Address?: string;
  "TIN Type"?: string;
  "TIN Number"?: string;
  "Place of Supply State"?: string;
  "Currency Code"?: string;
};

export type CreateOrUpdateLedgerExcelInput = Omit<
  Prisma.LedgerExcelUncheckedCreateInput,
  "batchJobId"
>;
