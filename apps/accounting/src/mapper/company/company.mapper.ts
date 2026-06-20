import { commonGetService } from "@/services/common.service.js";
import { BaseModelAttrWoCancel } from "@/types/common.js";
import {
  CompanyAddressDTO,
  CompanyDTO,
  CompanyResponse,
} from "@/types/company/company.js";
import { customOmit, removeBaseModel, toIdValue } from "av6-utils";
import { toCityDTO } from "@/mapper/master/city.mapper.js";
import { City } from "@repo/db/generated/prisma/client";
import { removeBaseModelArray } from "@/utils/helper.utils.js";

export const toCompanyDto = async (
  input: CompanyResponse
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
    | "companyCurrencySettings"
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
    "companyCurrencySettings",
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
    }
  );

  return {
    ...omittedData.rest,
    companyAddresses,
    companyStatutory: removeBaseModel(input.companyStatutory),
    companyFinancialYear: removeBaseModelArray(input.companyFinancialYears),
    companyCurrencySettings: removeBaseModel(input.companyCurrencySettings),
    companyFeatures: removeBaseModel(input.companyFeatures),
  };
};
