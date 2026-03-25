export interface CountryDTO {
  id: number;
  alpha2Code: string;
  alpha3Code: string;
  name: string;
  nationality: string;
}

export interface CreateCountryInput {
  alpha2Code: string | null;
  alpha3Code: string | null;
  enShortName: string;
  nationality: string;
}
export interface ExcelCountryRow {
  alpha2Code: string;
  alpha3Code: string;
  enShortName: string;
  nationality: string;
}

export interface UpdateCountryInput extends CreateCountryInput {
  id: number;
}
