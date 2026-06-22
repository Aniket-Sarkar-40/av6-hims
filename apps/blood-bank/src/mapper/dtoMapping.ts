import { BloodBankUINConfig } from "@repo/db/generated/prisma/client";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/bloodBank.shortCode.utils.js";
import { toUINConfigDTO } from "av6-core-v2";

// Define a type for DTO mapping functions.
type DtoMappingFunction = (data: unknown) => unknown;
export const dtoMapping: Record<string, DtoMappingFunction> = {
  [SHORT_CODE.UIN_CONFIG]: (data: unknown) =>
    toUINConfigDTO(data as BloodBankUINConfig),
};
