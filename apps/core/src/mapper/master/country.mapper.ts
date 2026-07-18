import {
  CountryDTO,
  CreateCountryInput,
  ExcelCountryRow,
} from "@/types/master/country.js";
import { Country } from "@repo/db/generated/prisma/client";

export const toExcelFromCountry = (
  country: CreateCountryInput | null,
): ExcelCountryRow => {
  return {
    alpha2Code: country?.alpha2Code ?? "",
    alpha3Code: country?.alpha3Code ?? "",
    enShortName: country?.enShortName ?? "",
    nationality: country?.nationality ?? "",
  };
};

export const toCountryFromExcel = (
  row: ExcelCountryRow,
): CreateCountryInput => {
  return {
    alpha2Code: row.alpha2Code,
    alpha3Code: row.alpha3Code,
    enShortName: row.enShortName,
    nationality: row.nationality,
  };
};

export const toCountryDto = async (country: Country): Promise<CountryDTO> => {
  return {
    id: country.id,
    alpha2Code: country?.alpha2Code ?? "",
    alpha3Code: country?.alpha3Code ?? "",
    name: country?.enShortName ?? "",
    nationality: country?.nationality ?? "",
  };
};
