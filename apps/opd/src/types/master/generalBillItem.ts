import { GeneralBillItem, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";

export type CreateGeneralBillItemMasterInput = Omit<
  Prisma.GeneralBillItemUncheckedCreateInput,
  | "id"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export interface UpdateGeneralBillItemMasterInput extends CreateGeneralBillItemMasterInput {
  id: number;
}

export interface GeneralBillItemMasterDTO extends Omit<
  GeneralBillItem,
  "isActive" | "createdBy" | "updatedBy" | "deletedBy" | "deletedAt"
> {
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
}
