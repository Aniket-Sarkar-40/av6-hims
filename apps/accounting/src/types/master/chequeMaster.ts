import { ChequeMaster, Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "../common.js";
import { IdValue } from "../global.js";

export type CreateOrUpdateChequeMasterInput = Omit<
  Prisma.ChequeMasterUncheckedCreateInput,
  BaseModelAttrWoCancel
>;

export interface ChequeMasterDTO
  extends Omit<ChequeMaster, BaseModelAttrWoCancel | "bankLedgerId"> {
  bankLedger: IdValue | null;
}
