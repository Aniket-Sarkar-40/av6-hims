import { countryService } from "@/services/master/country.service.js";
import {
  CreateStateInput,
  ExcelStateRow,
  StateDTO,
  StateDTOForState,
} from "@/types/master/state.js";

import { State } from "@repo/db/generated/prisma/client";

export const toStateDTO = async (state: State): Promise<StateDTO> => {
  const country = await countryService.getCountryById(state.countryId, true);
  return {
    state: state,
    country: country || null,
  };
};

export const toStateDTOForState = async (
  state: State
): Promise<StateDTOForState> => {
  const country = await countryService.getCountryById(state.countryId, true);
  return {
    ...state,
    country: country || null,
  };
};

export const toExcelFromState = (
  state: CreateStateInput | null
): ExcelStateRow => {
  return {
    Name: state ? state.name : "",
    Country: state ? Number(state.countryId) : null,
  };
};

export const toStateFromExcel = (row: ExcelStateRow): CreateStateInput => {
  return {
    name: row.Name,
    countryId: Number(row.Country), // Ensure the country value is a number
  };
};
