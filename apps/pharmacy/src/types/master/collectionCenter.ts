import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { BranchDTO } from "./branch.js";
import { WarehouseDTO } from "./warehouse.js";
import { Prisma } from "@repo/db/generated/prisma/browser.js";

export type CollectionCenterReq = Omit<
  Prisma.CollectionCenterUncheckedCreateInput,
  BaseModelAttrWoCancel
>;

export interface BranchOrWarehouseDTO {
  id: number;
  type: "Branch" | "Warehouse";
  name: string;
  branch: BranchDTO | null;
  warehouse: WarehouseDTO | null;
}
