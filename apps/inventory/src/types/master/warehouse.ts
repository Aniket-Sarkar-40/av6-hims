import {
  CollectionCenter,
  InvWarehouse,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttr } from "@repo/shared/types/global.js";

export type WarehouseReq = Prisma.InvWarehouseUncheckedCreateInput;
export interface WarehouseDTO extends Omit<InvWarehouse, BaseModelAttr> {
  collectionCenter: CollectionCenter | null;
}
export interface WarehouseDTOLocation extends Omit<
  InvWarehouse,
  BaseModelAttr
> {
  collectionCenter: CollectionCenter | null;
}

export type WarehouseResponse = Prisma.InvWarehouseGetPayload<{
  include: {
    collectionCenter: true;
  };
}>;
