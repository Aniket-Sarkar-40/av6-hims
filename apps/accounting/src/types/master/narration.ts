import { Narration, Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttr, BaseModelAttrWoCancel } from "../common.js";
import { IdValue } from "../global.js";

export type CreateOrUpdateNarrationInput = Omit<
  Prisma.NarrationUncheckedCreateInput,
  BaseModelAttr
>;

export interface NarrationDTO extends Omit<
  Narration,
  BaseModelAttrWoCancel | "voucherTypeId"
> {
  voucherType: IdValue | null;
}
