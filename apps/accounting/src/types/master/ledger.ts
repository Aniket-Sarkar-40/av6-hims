import { BaseModelAttrWoCancel } from "@/types/common.js";
import { IdValue } from "../global.js";
import { Ledger, Prisma } from "@repo/db/generated/prisma/client";

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
    BaseModelAttrWoCancel | "company" | "companyId" | "groupId"
  > {
  company: IdValue | null;
  group: IdValue | null;
}

export interface LedgerDTOForTrialBalance
  extends Omit<Ledger, BaseModelAttrWoCancel | "companyId" | "groupId"> {
  group: IdValue | null;
  parentGroup: IdValue | null;
}
