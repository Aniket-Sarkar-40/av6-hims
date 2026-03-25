import { Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttr } from "@repo/shared/types/global.js";

export type UnitMasterReq = Omit<
  Prisma.InvUnitMasterUncheckedCreateInput,
  "id"
>;

export interface UnitMasterUpdate extends Omit<
  Prisma.InvUnitMasterUncheckedCreateInput,
  "id"
> {
  id: number;
}

export type UnitMasterDto = Omit<
  Prisma.InvUnitMasterUncheckedCreateInput,
  BaseModelAttr
>;
