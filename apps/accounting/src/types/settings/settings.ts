import { AccSettings, Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttr, BaseModelAttrWoCancel } from "../common.js";
import { IdValue } from "@/types/global.js";

export type CreateOrUpdateSettings = Omit<
  Prisma.AccSettingsUncheckedCreateInput,
  BaseModelAttr
> & {
  existing: SettingsDTO | null;
};

export interface SettingsDTO extends Omit<
  AccSettings,
  BaseModelAttrWoCancel | "mainBranchId"
> {
  mainBranch: IdValue | null;
}
