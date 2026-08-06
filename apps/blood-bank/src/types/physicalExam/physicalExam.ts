import { BloodDonationPhysicalExamAnswerDTO } from "@/types/physicalExamAnswer/physicalExamAnswer.js";
import {
  BloodDonationPhysicalExam,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";
import {
  BaseModelAttr,
  BaseModelAttrWoCancel,
} from "@repo/shared/types/global.js";

export type BloodDonationPhysicalExamAnswers = Omit<
  Prisma.BloodDonationPhysicalExamAnswerUncheckedCreateInput,
  BaseModelAttrWoCancel | "physicalExamId"
>;

export interface CreateOrUpdateBloodDonationPhysicalExam extends Omit<
  Prisma.BloodDonationPhysicalExamUncheckedCreateInput,
  BaseModelAttr
> {
  examResponse: BloodDonationPhysicalExamAnswers[];
}

export interface BloodDonationPhysicalExamDTO extends Omit<
  BloodDonationPhysicalExam,
  BaseModelAttrWoCancel | "bloodBankCenterId" | "donorId" | "examinedByStaffId"
> {
  bloodBankCenter: IdValue | null;
  donor: IdValue | null;
  examinedByStaff: IdValue | null;
  answers: BloodDonationPhysicalExamAnswerDTO[];
}

export type BloodDonationPhysicalExamResponse =
  Prisma.BloodDonationPhysicalExamGetPayload<{
    include: {
      answers: true;
    };
  }>;
