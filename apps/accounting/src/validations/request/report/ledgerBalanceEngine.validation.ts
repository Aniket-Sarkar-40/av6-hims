import { numberArrayOptional } from "@repo/shared/utils/joi.utils.js";
import { reportCommonRequestInputSchema } from "./report.validation.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const ledgerBalanceEngineRequestInputSchema =
  reportCommonRequestInputSchema.keys({
    ledgerIds: numberArrayOptional("Ledger Ids"),
  });

export const validateLedgerBalanceEngineRequestInput = validationHandler({
  schema: ledgerBalanceEngineRequestInputSchema,
  path: "body",
});
