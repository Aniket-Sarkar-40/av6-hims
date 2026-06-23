import { BloodComponent, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";
import {
  BaseModelAttr,
  BaseModelAttrWoCancel,
} from "@repo/shared/types/global.js";

export type CreateOrUpdateBloodComponent = Omit<
  Prisma.BloodComponentUncheckedCreateInput,
  BaseModelAttr
>;

export interface BloodComponentDTO
  extends Omit<BloodComponent, BaseModelAttrWoCancel | "bloodBankCenterId"> {
  bloodBankCenter: IdValue | null;
}
