import { CityDTO } from "@apps/core/types/master/city.js";
import {
  CollectionCenter,
  PmsWarehouse,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";

export type WarehouseReq = Omit<
  Prisma.PmsWarehouseUncheckedCreateInput,
  BaseModelAttrWoCancel
>;

export interface WarehouseDTO
  extends Omit<
    PmsWarehouse,
    BaseModelAttrWoCancel | "countryId" | "cityId" | "stateId"
  > {
  location: CityDTO | null;
  collectionCenter: CollectionCenter | null;
  isActive: boolean;
  createdBy: number | null;
  updatedBy: number | null;
}
