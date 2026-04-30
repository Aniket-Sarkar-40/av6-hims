import { Country, Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttr } from "@repo/shared/types/global.js";

export type CountryDTO = Omit<Country, BaseModelAttr>;

export type CreateCountryInput = Prisma.CountryUncheckedCreateInput;

export interface ExcelCountryRow {
  alpha2Code: string;
  alpha3Code: string;
  enShortName: string;
  nationality: string;
}

export interface UpdateCountryInput extends CreateCountryInput {
  id: number;
}
