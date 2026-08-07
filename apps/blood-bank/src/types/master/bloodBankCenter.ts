import { BloodBankCenter, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";
import {
  BaseModelAttr,
  BaseModelAttrWoCancel,
} from "@repo/shared/types/global.js";

export type CreateOrUpdateBloodBankCenter = Omit<
  Prisma.BloodBankCenterUncheckedCreateInput,
  BaseModelAttr
>;

export interface BloodBankCenterDTO extends Omit<
  BloodBankCenter,
  BaseModelAttrWoCancel | "hospitalId"
> {
  hospital: IdValue | null;
}
