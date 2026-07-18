import { commonGetService } from "@/services/common.service.js";
import { BaseModelAttrWoCancel } from "@/types/common.js";
import {
  CompanyAddressDTO,
  CompanyDTO,
  CompanyResponse,
} from "@/types/company/company.js";
import { customOmit, toIdValue } from "av6-utils";
import { removeBaseModel, removeBaseModelArray } from "@/utils/helper.utils.js";
import { City } from "@repo/db/generated/prisma/client";
import { toCityDTO } from "@/mapper/master/city.mapper.js";
import { currencyService } from "@apps/core/services/master/currency.service.js";

export const toCompanyDto = async (
  input: CompanyResponse,
): Promise<CompanyDTO> => {
  const cities = (await commonGetService.getAllElements<"City">({
    cacheCode: "CITY",
    canNullReturnable: true,
    modelName: "City",
    shortCode: "CITY",
    useActiveFlag: true,
  })) as City[];

  const citiesDto = await toCityDTO(cities);
  const omittedData = customOmit<
    CompanyResponse,
    | BaseModelAttrWoCancel
    | "companyAddresses"
    | "companyStatutory"
    | "companyFinancialYears"
    | "currencyId"
    | "companyFeatures"
  >(input, [
    "isActive",
    "createdBy",
    "createdAt",
    "updatedBy",
    "updatedAt",
    "deletedBy",
    "deletedAt",
    "companyAddresses",
    "companyStatutory",
    "companyFinancialYears",
    "currencyId",
    "companyFeatures",
  ]);

  const companyAddresses: CompanyAddressDTO[] = input.companyAddresses.map(
    (address) => {
      const city = citiesDto.find((city) => city.id === address.cityId);

      return {
        ...customOmit(address, [
          "cityId",
          "stateId",
          "countryId",
          "isActive",
          "createdBy",
          "updatedBy",
          "deletedBy",
          "createdAt",
          "updatedAt",
          "deletedAt",
        ]).rest,
        city: city ? toIdValue(city, "name") : null,
        state: city?.state ? toIdValue(city.state, "value") : null,
        country: city?.country ? toIdValue(city.country, "value") : null,
      };
    },
  );

  const currency = input.currencyId
    ? await currencyService.getCurrencyById(input.currencyId)
    : null;
  return {
    ...omittedData.rest,
    companyAddresses,
    companyStatutory: removeBaseModel(input.companyStatutory),
    companyFinancialYear: removeBaseModelArray(input.companyFinancialYears),
    currency: currency ? removeBaseModel(currency) : null,
    companyFeatures: removeBaseModel(input.companyFeatures),
  };
};
