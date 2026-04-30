import { Prisma, State } from "@repo/db/generated/prisma/client";
import { CountryDTO } from "./country.js";

export interface StateDTO {
  state: State;
  country: CountryDTO | null;
}

export interface StateDTOForState {
  name: string;
  id: number;
  countryId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  country: CountryDTO | null;
}

export type CreateStateInput = Prisma.StateUncheckedCreateInput;

export interface ExcelStateRow {
  Name: string;
  Country: number | null;
}

export interface UpdateStateInput extends CreateStateInput {
  id: number;
}
