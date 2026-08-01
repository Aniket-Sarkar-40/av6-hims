import {
  BloodDonationPhysicalExamAnswer,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";
import {
  BaseModelAttr,
  BaseModelAttrWoCancel,
} from "@repo/shared/types/global.js";

export type CreateOrUpdateBloodDonationPhysicalExamAnswer = Omit<
  Prisma.BloodDonationPhysicalExamAnswerUncheckedCreateInput,
  BaseModelAttr
>;

export interface BloodDonationPhysicalExamAnswerDTO extends Omit<
  BloodDonationPhysicalExamAnswer,
  BaseModelAttrWoCancel | "physicalExamId" | "questionId"
> {
  physicalExam: IdValue | null;
  question: IdValue | null;
}
