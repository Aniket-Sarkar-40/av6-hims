import { Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttr } from "@repo/shared/types/global.js";

export type CreateOrUpdateStorage = Omit<
  Prisma.InvStorageUncheckedCreateWithoutInvItemInput,
  BaseModelAttr
>;
