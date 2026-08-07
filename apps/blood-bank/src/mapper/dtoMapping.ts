import { toBloodCollectionDTO } from "@/mapper/bloodCollection/bloodCollection.mapper.js";
import { toBloodDonorDTO } from "@/mapper/bloodDonor/bloodDonor.mapper.js";
import { toBloodBankCenterDTO } from "@/mapper/master/bloodBankCenter.mapper.js";
import { toBloodComponentDTO } from "@/mapper/master/bloodComponent.mapper.js";
import { toBloodCrossMatchMethodDTO } from "@/mapper/master/bloodCrossMatchMethod.mapper.js";
import { toBloodExternalCenterDTO } from "@/mapper/master/bloodExternalCenter.mapper.js";
import { toBloodPhysicalExamQuestionDTO } from "@/mapper/master/bloodPhysicalExamQuestion.mapper.js";
import { toBloodDonationPhysicalExamDTO } from "@/mapper/physicalExam/physicalExam.mapper.js";
import { BloodCollectionResponse } from "@/types/bloodCollection/bloodCollection.js";
import { BloodDonationPhysicalExamResponse } from "@/types/physicalExam/physicalExam.js";
import {
  BloodBankCenter,
  BloodBankUINConfig,
  BloodComponent,
  BloodCrossMatchMethod,
  BloodDonor,
  BloodExternalCenter,
  BloodPhysicalExamQuestion,
} from "@repo/db/generated/prisma/client";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/bloodBank.shortCode.utils.js";
import { toUINConfigDTO } from "av6-core-v2";

// Define a type for DTO mapping functions.
type DtoMappingFunction = (data: unknown) => unknown;
export const dtoMapping: Record<string, DtoMappingFunction> = {
  [SHORT_CODE.UIN_CONFIG]: (data: unknown) =>
    toUINConfigDTO(data as BloodBankUINConfig),
  [SHORT_CODE.BLOOD_BANK_CENTER]: (data: unknown) =>
    toBloodBankCenterDTO(data as BloodBankCenter[]),
  [SHORT_CODE.BLOOD_COMPONENT]: (data: unknown) =>
    toBloodComponentDTO(data as BloodComponent[]),
  [SHORT_CODE.BLOOD_CROSS_MATCH_METHOD]: (data: unknown) =>
    toBloodCrossMatchMethodDTO(data as BloodCrossMatchMethod[]),
  [SHORT_CODE.BLOOD_PHYSICAL_EXAM_QUESTION]: (data: unknown) =>
    toBloodPhysicalExamQuestionDTO(data as BloodPhysicalExamQuestion[]),
  [SHORT_CODE.BLOOD_EXTERNAL_CENTER]: (data: unknown) =>
    toBloodExternalCenterDTO(data as BloodExternalCenter[]),
  [SHORT_CODE.BLOOD_DONOR]: (data: unknown) =>
    toBloodDonorDTO(data as BloodDonor[]),
  [SHORT_CODE.BLOOD_COLLECTION]: (data: unknown) =>
    toBloodCollectionDTO(data as BloodCollectionResponse[]),
  [SHORT_CODE.BLOOD_DONATION_PHYSICAL_EXAM]: (data: unknown) =>
    toBloodDonationPhysicalExamDTO(data as BloodDonationPhysicalExamResponse[]),
};
