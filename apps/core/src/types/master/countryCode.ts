import { CountryCode, Prisma } from "@repo/db/generated/prisma/client";
import { CountryDTO } from "./country.js";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";

export type CreateCountryCode = Prisma.CountryCodeUncheckedCreateInput;

export interface UpdateCountryCode extends CreateCountryCode {
  id: number;
}

export interface CountryCodeDTO
  extends Omit<CountryCode, BaseModelAttrWoCancel | "countryId"> {
  country: CountryDTO | null;
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: number | null;
  updatedBy: number | null;
}
