import { DistributorResponse } from "@/types/distributor/distributor.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/pharmacy.shortCode.utils.js";
import { createDistributorServiceValidation } from "@/validations/service/distributor/distributor.service.validation.js";
import {
  fromDistributorExcel,
  toDistributorExcel,
} from "./distributor/distributor.mapper.js";

export const mappingExport: {
  [key: string]: (record: unknown) => unknown;
} = {
  [SHORT_CODE.DISTRIBUTOR]: (record: unknown) =>
    toDistributorExcel(record as DistributorResponse),
};

export const mappingImport: {
  [key: string]: () => {
    mapper: unknown;
    validation?: unknown;
  };
} = {
  [SHORT_CODE.DISTRIBUTOR]: () => {
    return {
      mapper: fromDistributorExcel,
      validation: createDistributorServiceValidation,
    };
  },
};
