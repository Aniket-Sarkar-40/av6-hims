import { CreateOrUpdateBloodBankCenter } from "@/types/master/bloodBankCenter.js";
import { createOrUpdateBloodBankCenterServiceValidation } from "@/validations/service/master/bloodBank.service.validation.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/bloodBank.shortCode.utils.js";
import { SingleValidationMapping } from "av6-core-v2";

export const commonCreateUpdateValidationMapping: Record<
  string,
  SingleValidationMapping
> = {
  [SHORT_CODE.BLOOD_BANK_CENTER]: {
    create: (data: unknown) =>
      createOrUpdateBloodBankCenterServiceValidation(
        data as CreateOrUpdateBloodBankCenter
      ),
    update: (data: unknown) =>
      createOrUpdateBloodBankCenterServiceValidation(
        data as CreateOrUpdateBloodBankCenter
      ),
  },
};
