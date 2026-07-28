import { BloodExternalCenter, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";
import {
  BaseModelAttr,
  BaseModelAttrWoCancel,
} from "@repo/shared/types/global.js";

export type CreateOrUpdateBloodExternalCenter = Omit<
  Prisma.BloodExternalCenterUncheckedCreateInput,
  BaseModelAttr
>;

export interface BloodExternalCenterDTO extends Omit<
  BloodExternalCenter,
  BaseModelAttrWoCancel | "bloodBankCenterId"
> {
  bloodBankCenter: IdValue | null;
}
