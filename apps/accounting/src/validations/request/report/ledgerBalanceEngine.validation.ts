import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { reportCommonRequestInputSchema } from "./report.validation.js";
import { numberArrayOptional } from "@repo/shared/utils/joi.utils.js";

export const ledgerBalanceEngineRequestInputSchema =
  reportCommonRequestInputSchema.keys({
    ledgerIds: numberArrayOptional("Ledger Ids"),
  });

export const validateLedgerBalanceEngineRequestInput = validationHandler({
  schema: ledgerBalanceEngineRequestInputSchema,
});
