import { Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttr } from "@repo/shared/types/global.js";

export type ItemCategoryReq = Prisma.InvItemCategoryCreateInput;

export interface ItemCategoryUpdate extends ItemCategoryReq {
  id: number;
}

export type ItemCategoryDto = Omit<
  Prisma.InvItemCategoryUncheckedCreateInput,
  BaseModelAttr | "isLock" | "isAutoConsumption" | "description"
>;
