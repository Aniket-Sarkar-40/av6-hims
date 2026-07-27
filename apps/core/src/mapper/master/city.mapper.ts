import { stateService } from "@/services/master/state.service.js";
import {
  CityDTO,
  CityDTOForCity,
  CreateCityInput,
  ExcelCityRow,
} from "@/types/master/city.js";
import { City } from "@repo/db/generated/prisma/client";

export const toCityDTO = async (city: City): Promise<CityDTO> => {
  const state = await stateService.getStateById(city.stateId, true);
  return {
    city: city,
    state: state?.state || null,
    country: state?.country || null,
  };
};

export const toCityDTOOnlyForCity = async (
  city: City,
): Promise<CityDTOForCity> => {
  const state = await stateService.getStateById(city.stateId, true);
  return {
    ...city,
    state: state?.state || null,
    country: state?.country || null,
  };
};

export const toExcelFromCity = (city: CreateCityInput | null): ExcelCityRow => {
  return {
    Name: city ? city.name : "",
    State: city ? city.stateId.toString() : "", // Convert stateId to string
    Country: city ? city.countryId.toString() : "", // Convert countryId to string
  };
};

export const toCityFromExcel = (row: ExcelCityRow): CreateCityInput => {
  return {
    name: row.Name,
    stateId: Number(row.State), // Convert state to number (ensure it's a valid ID)
    countryId: Number(row.Country), // Convert country to number (ensure it's a valid ID)
  };
};
