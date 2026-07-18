import { getAllCountryFromDb } from "@/repository/master/country.repository.js";
import { commonGetService } from "@/services/common.service.js";
import { CityDTO } from "@/types/master/city.js";
import { toIdValueCountry } from "@/utils/helper.utils.js";
import { City } from "@repo/db/generated/prisma/client";
import { customOmit } from "av6-core-v2";
import { toIdValue } from "av6-utils";

export const toCityDTO = async (data: City[]): Promise<CityDTO[]> => {
  const countries = await getAllCountryFromDb();
  const states = await commonGetService.getAllElements<"State">({
    cacheCode: "STATE",
    canNullReturnable: true,
    modelName: "State",
    shortCode: "STATE",
    useActiveFlag: true,
  });

  return Promise.all(
    data.map(async (city) => {
      const omittedCity = customOmit<
        City,
        | "isActive"
        | "createdBy"
        | "updatedBy"
        | "deletedBy"
        | "createdAt"
        | "updatedAt"
        | "deletedAt"
        | "stateId"
        | "countryId"
      >(city, [
        "isActive",
        "createdBy",
        "updatedBy",
        "deletedBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
        "stateId",
        "countryId",
      ]);

      const state = states.find((st) => st.id === city.stateId);
      const country = countries.find((count) => count.id === city.countryId);

      return {
        ...omittedCity.rest,
        state: toIdValue(state, "name"),
        country: toIdValueCountry(country, "enShortName"),
      };
    }),
  );
};
