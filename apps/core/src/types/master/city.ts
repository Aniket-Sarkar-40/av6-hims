import { City, Prisma, State } from "@repo/db/generated/prisma/client";
import { CountryDTO } from "./country.js";

export interface CityDTO {
  city: City;
  state: State | null;
  country: CountryDTO | null;
}

export interface CityDTOForCity {
  name: string;
  id: number;
  stateId: number;
  countryId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  state: State | null;
  country: CountryDTO | null;
}

export type CreateCityInput = Prisma.CityUncheckedCreateInput;

// export interface CreateCityInput {
//   name: string;
//   stateId: number;
//   countryId: number;
// }
export interface ExcelCityRow {
  Name: string;
  State: string;
  Country: string;
}

export interface UpdateCityInput extends CreateCityInput {
  id: number;
}
