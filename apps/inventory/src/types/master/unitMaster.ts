import { InvUnitMaster, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";
import { BaseModelAttr } from "@repo/shared/types/global.js";

export type UnitMasterReq = Omit<
  Prisma.InvUnitMasterUncheckedCreateInput,
  "id"
>;

export interface UnitMasterUpdate
  extends Omit<Prisma.InvUnitMasterUncheckedCreateInput, "id"> {
  id: number;
}

export interface UnitMasterDTO
  extends Omit<InvUnitMaster, BaseModelAttr | "defaultUnitMasterId"> {
  defaultUnitMaster: IdValue | null;
}
