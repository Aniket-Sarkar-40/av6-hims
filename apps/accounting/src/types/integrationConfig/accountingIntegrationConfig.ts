import {
  AccountingIntegrationConfigDetails,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "../common.js";
import { IdValue } from "../global.js";

export type CreateOrUpdateAccountingIntegrationConfigDetailsInput = Omit<
  Prisma.AccountingIntegrationConfigDetailsUncheckedCreateInput,
  BaseModelAttrWoCancel | "accountingIntegrationConfigId"
>;

export interface CreateOrUpdateAccountingIntegrationConfigInput
  extends Omit<
    Prisma.AccountingIntegrationConfigCreateManyInput,
    BaseModelAttrWoCancel | "accountingIntegrationConfigDetails"
  > {
  accountingIntegrationConfigDetails: CreateOrUpdateAccountingIntegrationConfigDetailsInput[];
  existing: AccountingIntegrationConfigResponse;
}

export type AccountingIntegrationConfigResponse =
  Prisma.AccountingIntegrationConfigGetPayload<{
    include: {
      accountingIntegrationConfigDetails: {
        where: {
          isActive: true;
        };
      };
    };
  }>;

export interface AccountingIntegrationConfigDetailsDTO
  extends Omit<
    AccountingIntegrationConfigDetails,
    BaseModelAttrWoCancel | "groupId" | "ledgerValue"
  > {
  group: IdValue | null;
  ledgerValue: IdValue | null | string;
}

export interface AccountingIntegrationConfigDTO
  extends Omit<
    AccountingIntegrationConfigResponse,
    | BaseModelAttrWoCancel
    | "voucherTypeId"
    | "accountingIntegrationConfigDetails"
  > {
  voucherType: IdValue | null;

  accountingIntegrationConfigDetails: AccountingIntegrationConfigDetailsDTO[];
}
