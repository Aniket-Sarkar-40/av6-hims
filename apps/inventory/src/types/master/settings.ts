import { InvSettings, Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttr } from "@repo/shared/types/global.js";

export type CreateOrUpdateSettings = Omit<
  Prisma.InvSettingsUncheckedCreateInput,
  BaseModelAttr
>;
