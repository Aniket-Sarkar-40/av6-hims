import {
  BloodDonationPhysicalExam,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";
import {
  BaseModelAttr,
  BaseModelAttrWoCancel,
} from "@repo/shared/types/global.js";

export type CreateOrUpdateBloodDonationPhysicalExam = Omit<
  Prisma.BloodDonationPhysicalExamUncheckedCreateInput,
  BaseModelAttr
>;

export interface BloodDonationPhysicalExamDTO extends Omit<
  BloodDonationPhysicalExam,
  | BaseModelAttrWoCancel
  | "bloodBankCenterId"
  | "donorId"
  | "collectionId"
  | "examinedByStaffId"
> {
  bloodBankCenter: IdValue | null;
  donor: IdValue | null;
  collection: IdValue | null;
  examinedByStaff: IdValue | null;
}
