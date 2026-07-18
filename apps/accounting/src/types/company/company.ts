import {
  CompanyAddress,
  CompanyFeatures,
  CompanyFinancialYear,
  CompanyStatutory,
  Currency,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "../common.js";
import { IdValue } from "../global.js";

export type CompanyAddressCreateInput = Omit<
  Prisma.CompanyAddressUncheckedCreateInput,
  BaseModelAttrWoCancel
>;

export type CompanyStatutoryCreateInput = Omit<
  Prisma.CompanyStatutoryUncheckedCreateInput,
  BaseModelAttrWoCancel
>;

export type CompanyFinancialYearCreateInput = Omit<
  Prisma.CompanyFinancialYearUncheckedCreateInput,
  BaseModelAttrWoCancel
>;

export type CompanyFeaturesCreateInput = Omit<
  Prisma.CompanyFeaturesUncheckedCreateInput,
  BaseModelAttrWoCancel
>;

export interface CreateOrUpdateCompanyInput extends Omit<
  Prisma.CompanyUncheckedCreateInput,
  BaseModelAttrWoCancel
> {
  addresses: CompanyAddressCreateInput[];
  statutory: CompanyStatutoryCreateInput;
  financialYears: CompanyFinancialYearCreateInput;
  features: CompanyFeaturesCreateInput;

  existing: CompanyResponse;
}

export type CompanyResponse = Prisma.CompanyGetPayload<{
  include: {
    companyAddresses: {
      where: {
        isActive: true;
      };
    };
    companyFinancialYears: {
      where: {
        isActive: true;
      };
    };
    companyStatutory: true;
    companyFeatures: true;
  };
}>;

export interface CompanyAddressDTO extends Omit<
  CompanyAddress,
  BaseModelAttrWoCancel | "cityId" | "stateId" | "countryId"
> {
  city: IdValue | null;
  state: IdValue | null;
  country: IdValue | null;
}

export type CompanyFinancialYearDTO = Omit<
  CompanyFinancialYear,
  BaseModelAttrWoCancel
>;

export interface CompanyDTO extends Omit<
  CompanyResponse,
  | BaseModelAttrWoCancel
  | "companyAddresses"
  | "companyStatutory"
  | "companyFinancialYears"
  | "companyFeatures"
  | "currencyId"
> {
  currency: Omit<Currency, BaseModelAttrWoCancel> | null;
  companyAddresses: CompanyAddressDTO[];
  companyStatutory: Omit<CompanyStatutory, BaseModelAttrWoCancel> | null;
  companyFinancialYear: CompanyFinancialYearDTO[];
  companyFeatures: Omit<CompanyFeatures, BaseModelAttrWoCancel> | null;
}
