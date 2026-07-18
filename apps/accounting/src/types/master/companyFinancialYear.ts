import { IdValue } from "../global.js";
import { BaseModelAttrWoCancel } from "../common.js";
import { Prisma } from "@repo/db/generated/prisma/client";

export type CreateOrUpdateCompanyFinancialYear = Omit<
  Prisma.CompanyFinancialYearUncheckedCreateInput,
  BaseModelAttrWoCancel
>;

export type CompanyFinancialYearResponse =
  Prisma.CompanyFinancialYearGetPayload<{
    include: {
      company: true;
    };
  }>;

export interface CompanyFinancialYearDTO extends Omit<
  CompanyFinancialYearResponse,
  BaseModelAttrWoCancel | "company" | "companyId"
> {
  company: IdValue | null;
}
