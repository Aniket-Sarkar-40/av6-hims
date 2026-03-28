import { DistributorResponse } from "@/types/distributor/distributor.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import { createDistributorServiceValidation } from "@/validations/service/distributor/distributor.service.validation.js";
import { createCityServiceValidation } from "@/validations/service/master/city.service.validation.js";
import { createCountryServiceValidation } from "@/validations/service/master/country.service.validation.js";
import { nameStateServiceValidation } from "@/validations/service/master/state.service.validation.js";
import { City, State } from "@repo/db/generated/prisma/client";
import {
  fromDistributorExcel,
  toDistributorExcel,
} from "./distributor/distributor.mapper.js";
import { toCityFromExcel, toExcelFromCity } from "./master/city.mapper.js";
import { toCountryFromExcel } from "./master/country.mapper.js";
import { toExcelFromState, toStateFromExcel } from "./master/state.mapper.js";

export const mappingExport: {
  [key: string]: (record: unknown) => unknown;
} = {
  [SHORT_CODE.STATE]: (record: unknown) => toExcelFromState(record as State),
  [SHORT_CODE.CITY]: (record: unknown) => toExcelFromCity(record as City),
  [SHORT_CODE.DISTRIBUTOR]: (record: unknown) =>
    toDistributorExcel(record as DistributorResponse),
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
  [SHORT_CODE.DISTRIBUTOR]: () => {
    return {
      mapper: fromDistributorExcel,
      validation: createDistributorServiceValidation,
    };
  },
};
