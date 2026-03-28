import { CountryDTO } from "./country.js";

export interface CreateCountryCode {
  countryCode: string;
  countryId: number;
}

export interface UpdateCountryCode extends CreateCountryCode {
  id: number;
}

export interface CountryCodeDTO {
  id: number;
  countryCode: string;
  country: CountryDTO | null;
  createdBy: number | null;
  createdAt: Date;
  updatedBy: number | null;
  updatedAt: Date;
}
