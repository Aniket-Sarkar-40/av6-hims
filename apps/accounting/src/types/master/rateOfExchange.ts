import { CompanyFinancialYear, Prisma } from "@repo/db/generated/prisma/client";
import {
  BaseModelAttrWoCancel,
  BaseModelAttrWoCancelAndCreated,
} from "../common.js";
import { IdValue } from "../global.js";

export type CreateRateOfExchangeInput = Omit<
  Prisma.RateOfExchangeUncheckedCreateInput,
  BaseModelAttrWoCancel | "id"
>;

export type RateOfExchangeResponse = Prisma.RateOfExchangeGetPayload<{
  include: {
    company: true;
    financialYear: true;
  };
}>;

export interface RateOfExchangeDTO
  extends Omit<
    RateOfExchangeResponse,
    | BaseModelAttrWoCancelAndCreated
    | "createdBy"
    | "company"
    | "financialYear"
    | "currencyId"
    | "currency"
    | "companyId"
    | "financialYearId"
  > {
  lastVoucherSellingRate: number | null;
  lastVoucherBuyingRate: number | null;
  currency: IdValue | null;
  company: IdValue | null;
  financialYear: Omit<CompanyFinancialYear, BaseModelAttrWoCancel>;
  createdBy: IdValue | null;
}

export enum FetchRateOfExchangeType {
  PURCHASE = "PURCHASE",
  SELL = "SELL",
  PAYMENT = "PAYMENT",
  RECEIPT = "RECEIPT",
  OTHER = "OTHER",
}

export type FetchRateOfExchangeInput = {
  companyId: number;
  currencyId: number;
  financialYearId: number;
  date: Date;
  type: FetchRateOfExchangeType;
};
