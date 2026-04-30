import { CountryCode, Prisma } from "@repo/db/generated/prisma/client";
import { CountryDTO } from "./country.js";

export type CreateCountryCode = Prisma.CountryCodeUncheckedCreateInput;

export interface UpdateCountryCode extends CreateCountryCode {
  id: number;
}

export interface CountryCodeDTO extends Omit<CountryCode, "countryId"> {
  country: CountryDTO | null;
}
