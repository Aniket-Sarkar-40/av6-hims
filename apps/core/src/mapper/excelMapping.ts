import {
  toCityFromExcel,
  toExcelFromCity,
} from "@/mapper/master/city.mapper.js";
import { toCountryFromExcel } from "@/mapper/master/country.mapper.js";
import {
  toExcelFromState,
  toStateFromExcel,
} from "@/mapper/master/state.mapper.js";
import { createCityServiceValidation } from "@/validations/service/master/city.service.validation.js";
import { createCountryServiceValidation } from "@/validations/service/master/country.service.validation.js";
import { nameStateServiceValidation } from "@/validations/service/master/state.service.validation.js";
import { City, State } from "@repo/db/generated/prisma/client";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/core.shortCode.utils.js";

export const mappingExport: {
  [key: string]: (record: unknown) => unknown;
} = {
  [SHORT_CODE.STATE]: (record: unknown) => toExcelFromState(record as State),
  [SHORT_CODE.CITY]: (record: unknown) => toExcelFromCity(record as City),
};

export const mappingImport: {
  [key: string]: () => {
    mapper: unknown;
    validation?: unknown;
  };
} = {
  [SHORT_CODE.STATE]: () => {
    return {
      mapper: toStateFromExcel,
      validation: nameStateServiceValidation,
    };
  },
  [SHORT_CODE.CITY]: () => {
    return {
      mapper: toCityFromExcel,
      validation: createCityServiceValidation,
    };
  },
  [SHORT_CODE.COUNTRY]: () => {
    return {
      mapper: toCountryFromExcel,
      validation: createCountryServiceValidation,
    };
  },
};
