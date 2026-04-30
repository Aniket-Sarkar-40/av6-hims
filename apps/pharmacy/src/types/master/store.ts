import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { BranchDTO } from "./branch.js";
import { WarehouseDTO } from "./warehouse.js";
import { Prisma, Store } from "@repo/db/generated/prisma/browser.js";

export type StoreCreateInput = Omit<
  Prisma.StoreUncheckedCreateInput,
  BaseModelAttrWoCancel | "id"
>;

export interface StoreUpdateInput extends StoreCreateInput {
  id: number;
}

export interface storeDTO
  extends Omit<Store, BaseModelAttrWoCancel | "branchId" | "wareHouseId"> {
  branch: BranchDTO | null;
  wareHouse: WarehouseDTO | null;
  createdAt: Date;
  updatedAt: Date;
}
