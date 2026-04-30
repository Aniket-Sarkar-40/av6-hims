import { MedCategory, Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";

export type MedCategoryInput = Omit<
  Prisma.MedCategoryUncheckedCreateInput,
  BaseModelAttrWoCancel
>;

export interface MedCategoryDTO
  extends Omit<MedCategory, BaseModelAttrWoCancel> {
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
  itemCount: number;
}
