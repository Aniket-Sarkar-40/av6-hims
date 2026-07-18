import {
  ClientLedgerMapping,
  ClientType,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "../common.js";
import { IdValue } from "@/types/global.js";

export type CreateOrUpdateClientLedgerMappingInput = Omit<
  Prisma.ClientLedgerMappingUncheckedCreateInput,
  BaseModelAttrWoCancel
>;

export enum MAPPING_STATUS {
  CREATED = "CREATED",
  CREATE = "CREATE",
}
export interface CreateExternalClientLedgerMappingInput extends Omit<
  Prisma.ClientLedgerMappingUncheckedCreateInput,
  BaseModelAttrWoCancel | "ledgerId"
> {
  ledgerId?: number;
  ledgerName?: string;
  currencyId?: number;
  creditPeriodInDays?: number;
  createdBy: number;
  mappingStatus: MAPPING_STATUS;
  overrideExistingLedger?: boolean | null;
}

export interface ClientLedgerMappingDTO extends Omit<
  ClientLedgerMapping,
  BaseModelAttrWoCancel | "ledgerId" | "clientId"
> {
  ledger: IdValue | null;
  client: IdValue | null;
}

export interface FetchClientLedgerMappingInput {
  clientType: ClientType;
  clientId: number;
}
