import {
  BloodPhysicalExamQuestion,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";
import {
  BaseModelAttr,
  BaseModelAttrWoCancel,
} from "@repo/shared/types/global.js";

export type CreateOrUpdateBloodPhysicalExamQuestion = Omit<
  Prisma.BloodPhysicalExamQuestionUncheckedCreateInput,
  BaseModelAttr
>;

export interface BloodPhysicalExamQuestionDTO extends Omit<
  BloodPhysicalExamQuestion,
  BaseModelAttrWoCancel | "bloodBankCenterId"
> {
  bloodBankCenter: IdValue | null;
}
