import { Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";

export type CurrencyReq = Omit<
  Prisma.CurrencyUncheckedCreateInput,
  BaseModelAttrWoCancel
>;
