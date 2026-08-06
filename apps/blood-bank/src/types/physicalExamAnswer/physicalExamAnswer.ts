import { BloodDonationPhysicalExamAnswer } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";

export interface BloodDonationPhysicalExamAnswerDTO extends Omit<
  BloodDonationPhysicalExamAnswer,
  BaseModelAttrWoCancel | "physicalExamId" | "questionId"
> {
  question: IdValue | null;
}
