import { CreateOrUpdateBloodCollection } from "@/types/bloodCollection/bloodCollection.js";
import { CreateOrUpdateBloodCollectionItem } from "@/types/bloodCollectionItem/bloodCollectionItem.js";
import { CreateOrUpdateBloodDonor } from "@/types/bloodDonor/bloodDonor.js";
import { CreateOrUpdateBloodBankCenter } from "@/types/master/bloodBankCenter.js";
import { CreateOrUpdateBloodComponent } from "@/types/master/bloodComponent.js";
import { CreateOrUpdateBloodCrossMatchMethod } from "@/types/master/bloodCrossMatchMethod.js";
import { CreateOrUpdateBloodExternalCenter } from "@/types/master/bloodExternalCenter.js";
import { CreateOrUpdateBloodPhysicalExamQuestion } from "@/types/master/bloodPhysicalExamQuestion.js";
import { createOrUpdateBloodCollectionServiceValidation } from "@/validations/service/bloodCollection/bloodCollection.service.validation.js";
import { createOrUpdateBloodCollectionItemServiceValidation } from "@/validations/service/bloodCollectionItem/bloodCollectionItem.service.validation.js";
import { createOrUpdateBloodDonorServiceValidation } from "@/validations/service/bloodDonor/bloodDonor.service.validation.js";
import { createOrUpdateBloodBankCenterServiceValidation } from "@/validations/service/master/bloodBankCenter.service.validation.js";
import { createOrUpdateBloodComponentServiceValidation } from "@/validations/service/master/bloodComponent.service.validation.js";
import { createOrUpdateBloodCrossMatchMethodServiceValidation } from "@/validations/service/master/bloodCrossMatchMethod.service.validation.js";
import { createOrUpdateBloodExternalCenterServiceValidation } from "@/validations/service/master/bloodExternalCenter.service.validation.js";
import { createOrUpdateBloodPhysicalExamQuestionServiceValidation } from "@/validations/service/master/bloodPhysicalExamQuestion.service.validation.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/bloodBank.shortCode.utils.js";
import { SingleValidationMapping } from "av6-core-v2";

export const commonCreateUpdateValidationMapping: Record<
  string,
  SingleValidationMapping
> = {
  [SHORT_CODE.BLOOD_BANK_CENTER]: {
    create: (data: unknown) =>
      createOrUpdateBloodBankCenterServiceValidation(
        data as CreateOrUpdateBloodBankCenter,
      ),
    update: (data: unknown) =>
      createOrUpdateBloodBankCenterServiceValidation(
        data as CreateOrUpdateBloodBankCenter,
      ),
  },
  [SHORT_CODE.BLOOD_COMPONENT]: {
    create: (data: unknown) =>
      createOrUpdateBloodComponentServiceValidation(
        data as CreateOrUpdateBloodComponent,
      ),
    update: (data: unknown) =>
      createOrUpdateBloodComponentServiceValidation(
        data as CreateOrUpdateBloodComponent,
      ),
  },
  [SHORT_CODE.BLOOD_CROSS_MATCH_METHOD]: {
    create: (data: unknown) =>
      createOrUpdateBloodCrossMatchMethodServiceValidation(
        data as CreateOrUpdateBloodCrossMatchMethod,
      ),
    update: (data: unknown) =>
      createOrUpdateBloodCrossMatchMethodServiceValidation(
        data as CreateOrUpdateBloodCrossMatchMethod,
      ),
  },
  [SHORT_CODE.BLOOD_PHYSICAL_EXAM_QUESTION]: {
    create: (data: unknown) =>
      createOrUpdateBloodPhysicalExamQuestionServiceValidation(
        data as CreateOrUpdateBloodPhysicalExamQuestion,
      ),
    update: (data: unknown) =>
      createOrUpdateBloodPhysicalExamQuestionServiceValidation(
        data as CreateOrUpdateBloodPhysicalExamQuestion,
      ),
  },
  [SHORT_CODE.BLOOD_EXTERNAL_CENTER]: {
    create: (data: unknown) =>
      createOrUpdateBloodExternalCenterServiceValidation(
        data as CreateOrUpdateBloodExternalCenter,
      ),
    update: (data: unknown) =>
      createOrUpdateBloodExternalCenterServiceValidation(
        data as CreateOrUpdateBloodExternalCenter,
      ),
  },
  [SHORT_CODE.BLOOD_DONOR]: {
    create: (data: unknown) =>
      createOrUpdateBloodDonorServiceValidation(
        data as CreateOrUpdateBloodDonor,
      ),
    update: (data: unknown) =>
      createOrUpdateBloodDonorServiceValidation(
        data as CreateOrUpdateBloodDonor,
      ),
  },
  [SHORT_CODE.BLOOD_COLLECTION]: {
    create: (data: unknown) =>
      createOrUpdateBloodCollectionServiceValidation(
        data as CreateOrUpdateBloodCollection,
      ),
    update: (data: unknown) =>
      createOrUpdateBloodCollectionServiceValidation(
        data as CreateOrUpdateBloodCollection,
      ),
  },
  [SHORT_CODE.BLOOD_COLLECTION_ITEM]: {
    create: (data: unknown) =>
      createOrUpdateBloodCollectionItemServiceValidation(
        data as CreateOrUpdateBloodCollectionItem,
      ),
    update: (data: unknown) =>
      createOrUpdateBloodCollectionItemServiceValidation(
        data as CreateOrUpdateBloodCollectionItem,
      ),
  },
};
