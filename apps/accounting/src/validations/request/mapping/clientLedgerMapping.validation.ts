import {
  CreateExternalClientLedgerMappingInput,
  FetchClientLedgerMappingInput,
  MAPPING_STATUS,
} from "@/types/mapping/clientLedgerMapping.js";
import { ClientType } from "@repo/db/generated/prisma/enums.js";
import {
  boolOptional,
  enumRequired,
  idOptional,
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const createExternalClientLedgerMappingSchema =
  Joi.object<CreateExternalClientLedgerMappingInput>({
    clientId: idRequired("Client Id"),
    clientType: enumRequired("Client Type", ClientType),
    ledgerId: Joi.when("mappingStatus", {
      is: MAPPING_STATUS.CREATED,
      then: idRequired("Ledger Id"),
      otherwise: idOptional("Ledger Id").allow(null),
    }),
    ledgerName: Joi.when("mappingStatus", {
      is: MAPPING_STATUS.CREATE,
      then: strRequired("Ledger Name"),
      otherwise: strOptional("Ledger Name"),
    }),
    currencyId: idOptional("Currency Id").allow(null),
    creditPeriodInDays: Joi.number()
      .min(0)
      .max(365)
      .optional()
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Credit Period In Days"
        ),
        "number.min": generateValidationErrorMessage(
          "NUMBER_MIN",
          "Credit Period In Days",
          "0"
        ),
        "number.max": generateValidationErrorMessage(
          "NUMBER_MAX",
          "Credit Period In Days",
          "365"
        ),
      }),
    createdBy: idRequired("Created By"),
    mappingStatus: enumRequired("Mapping Status", MAPPING_STATUS),
    overrideExistingLedger: boolOptional("Override Existing Ledger").allow(
      null
    ),
  });

export const fetchClientLedgerMappingSchema =
  Joi.object<FetchClientLedgerMappingInput>({
    clientType: enumRequired("Client Type", ClientType),
    clientId: idRequired("Client Id"),
  });
export const validateCreateExternalClientLedgerMapping = validationHandler({
  schema: createExternalClientLedgerMappingSchema,
});
export const validateFetchClientLedgerMapping = validationHandler({
  schema: fetchClientLedgerMappingSchema,
});
