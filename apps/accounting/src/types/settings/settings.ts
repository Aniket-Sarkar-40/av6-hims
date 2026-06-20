import { AccSettings, Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttr } from "../common.js";

export type CreateOrUpdateSettings = Omit<
  Prisma.AccSettingsUncheckedCreateInput,
  BaseModelAttr
> & {
  existing: AccSettings | null;
};
