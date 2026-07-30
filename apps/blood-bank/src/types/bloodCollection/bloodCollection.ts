import { BloodCollection, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";
import {
  BaseModelAttr,
  BaseModelAttrWoCancel,
} from "@repo/shared/types/global.js";

export type CreateOrUpdateBloodCollection = Omit<
  Prisma.BloodCollectionUncheckedCreateInput,
  BaseModelAttr
>;

export interface BloodCollectionDTO extends Omit<
  BloodCollection,
  | BaseModelAttrWoCancel
  | "bloodBankCenterId"
  | "donorId"
  | "receivedByStaffId"
  | "externalCenterId"
> {
  bloodBankCenter: IdValue | null;
  donor: IdValue | null;
  receivedByStaff: IdValue | null;
  externalCenter: IdValue | null;
}
