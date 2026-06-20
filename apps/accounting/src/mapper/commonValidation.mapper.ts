import { CreateOrUpdateAuditConfig } from "@/types/master/auditConfig.js";
import { CreateOrUpdateCostCenterInput } from "@/types/master/costCenter.js";
import { CreateOrUpdateGroupInput } from "@/types/master/group.js";
import { CreateOrUpdateLedgerInput } from "@/types/master/ledger.js";
import { CreateOrUpdateNarrationInput } from "@/types/master/narration.js";
import { CreateOrUpdateVoucherTypeInput } from "@/types/master/voucherType.js";
import { createOrUpdateAuditConfigServiceValidation } from "@/validations/service/master/auditConfig.service.validation.js";
import { CreateOrUpdateCostCenterServiceValidation } from "@/validations/service/master/costCenter.service.validation.js";
import { createOrUpdateGroupServiceValidation } from "@/validations/service/master/group.service.validation.js";
import { createOrUpdateLedgerServiceValidation } from "@/validations/service/master/ledger.service.validation.js";
import { createOrUpdateNarrationServiceValidation } from "@/validations/service/master/narration.service.validation.js";
import { createOrUpdateVoucherTypeServiceValidation } from "@/validations/service/master/voucherType.service.validation.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/accounting.shortCode.utils.js";
import { SingleValidationMapping } from "av6-core-v2";

export const commonCreateUpdateValidationMapping: Record<
  string,
  SingleValidationMapping
> = {
  [SHORT_CODE.AUDIT_CONFIG]: {
    create: (data: unknown) =>
      createOrUpdateAuditConfigServiceValidation(
        data as CreateOrUpdateAuditConfig
      ),
    update: (data: unknown) =>
      createOrUpdateAuditConfigServiceValidation(
        data as CreateOrUpdateAuditConfig
      ),
  },
  [SHORT_CODE.GROUP]: {
    create: (data: unknown) =>
      createOrUpdateGroupServiceValidation(data as CreateOrUpdateGroupInput),
    update: (data: unknown) =>
      createOrUpdateGroupServiceValidation(data as CreateOrUpdateGroupInput),
  },
  [SHORT_CODE.LEDGER]: {
    create: (data: unknown) =>
      createOrUpdateLedgerServiceValidation(data as CreateOrUpdateLedgerInput),
    update: (data: unknown) =>
      createOrUpdateLedgerServiceValidation(data as CreateOrUpdateLedgerInput),
  },
  [SHORT_CODE.VOUCHER_TYPE]: {
    create: (data: unknown) =>
      createOrUpdateVoucherTypeServiceValidation(
        data as CreateOrUpdateVoucherTypeInput
      ),
    update: (data: unknown) =>
      createOrUpdateVoucherTypeServiceValidation(
        data as CreateOrUpdateVoucherTypeInput
      ),
  },
  [SHORT_CODE.COST_CENTER]: {
    create: (data: unknown) =>
      CreateOrUpdateCostCenterServiceValidation(
        data as CreateOrUpdateCostCenterInput
      ),
    update: (data: unknown) =>
      CreateOrUpdateCostCenterServiceValidation(
        data as CreateOrUpdateCostCenterInput
      ),
  },
  [SHORT_CODE.NARRATION]: {
    create: (data: unknown) =>
      createOrUpdateNarrationServiceValidation(
        data as CreateOrUpdateNarrationInput
      ),
    update: (data: unknown) =>
      createOrUpdateNarrationServiceValidation(
        data as CreateOrUpdateNarrationInput
      ),
  },
};
