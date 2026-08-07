import { BloodDonor, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";
import {
  BaseModelAttr,
  BaseModelAttrWoCancel,
} from "@repo/shared/types/global.js";

export type CreateOrUpdateBloodDonor = Omit<
  Prisma.BloodDonorUncheckedCreateInput,
  BaseModelAttr
>;

export interface BloodDonorDTO extends Omit<
  BloodDonor,
  BaseModelAttrWoCancel | "bloodBankCenterId"
> {
  bloodBankCenter: IdValue | null;
}
