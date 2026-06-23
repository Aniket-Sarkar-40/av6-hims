import { toBloodBankCenterDTO } from "@/mapper/master/bloodBankCenter.mapper.js";
import { toBloodComponentDTO } from "@/mapper/master/bloodComponent.mapper.js";
import { toBloodCrossMatchMethodDTO } from "@/mapper/master/bloodCrossMatchMethod.mapper.js";
import {
  BloodBankCenter,
  BloodBankUINConfig,
  BloodComponent,
  BloodCrossMatchMethod,
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
};
