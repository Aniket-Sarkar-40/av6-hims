import { IdValue } from "../global.js";
import { BaseModelAttr } from "../common.js";
import { City, Prisma } from "@repo/db/generated/prisma/client";

export type CreateOrUpdateCity = Omit<
  Prisma.CityUncheckedCreateInput,
  BaseModelAttr
>;

export interface CityDTO
  extends Omit<City, BaseModelAttr | "stateId" | "countryId"> {
  state: IdValue | null;
  country: IdValue | null;
}
