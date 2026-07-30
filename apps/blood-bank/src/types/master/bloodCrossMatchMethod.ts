import {
  BloodCrossMatchMethod,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";
import {
  BaseModelAttr,
  BaseModelAttrWoCancel,
} from "@repo/shared/types/global.js";

export type CreateOrUpdateBloodCrossMatchMethod = Omit<
  Prisma.BloodCrossMatchMethodUncheckedCreateInput,
  BaseModelAttr
>;

export interface BloodCrossMatchMethodDTO extends Omit<
  BloodCrossMatchMethod,
  BaseModelAttrWoCancel | "bloodBankCenterId"
> {
  bloodBankCenter: IdValue | null;
}
