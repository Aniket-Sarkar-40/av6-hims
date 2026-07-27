import {
  ConfigLedgerType,
  ConfigSubRefType,
  ConfigType,
  DrCr,
  VoucherReferenceType,
} from "@repo/db/generated/prisma/enums.js";
import {
  boolRequired,
  enumOptional,
  enumRequired,
  idOptional,
  idRequired,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

const AccountingIntegrationConfigDetailsCreateSchema = Joi.object({
  type: enumRequired("Config Type", ConfigType),
  ledgerType: enumRequired("Ledger Type", ConfigLedgerType),
  ledgerValue: strRequired("Ledger Value"),
  policy: enumRequired("Policy", DrCr),
  amountKey: strRequired("Amount Key"),

  masterKey: Joi.when("type", {
    is: ConfigType.ARRAY,
    then: strRequired("Master Key"),
    otherwise: Joi.valid(null).messages({
      "any.only": generateValidationErrorMessage("ONLY_NULL", "Master Key"),
    }),
  }),

  groupId: Joi.when("isPaymentRelated", {
    is: false,
    then: Joi.when("ledgerType", {
      is: ConfigLedgerType.CREATABLE,
      then: idRequired("Group Id"),
      otherwise: Joi.valid(null).messages({
        "any.only": generateValidationErrorMessage("ONLY_NULL", "Group Id"),
      }),
    }),
    otherwise: Joi.valid(null).messages({
      "any.only": generateValidationErrorMessage("ONLY_NULL", "Group Id"),
    }),
  }),
  isPaymentRelated: boolRequired("Is Payment Related"),
});

const AccountingIntegrationConfigDetailsUpdateSchema =
  AccountingIntegrationConfigDetailsCreateSchema.keys({
    id: idOptional("Accounting Integration Config Detail Id"),
  });

const AccountingIntegrationConfigCreateSchema = Joi.object({
  refType: enumRequired("Reference Type", VoucherReferenceType),
  subRefType: enumOptional("Sub Reference Type", ConfigSubRefType).allow(null),
  voucherTypeId: idRequired("Voucher Type Id"),
  narrationText: strRequired("Narration Text"),
  accountingIntegrationConfigDetails: Joi.array()
    .items(AccountingIntegrationConfigDetailsCreateSchema)
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage(
        "INVALID",
        "Accounting Integration Config Details",
      ),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Accounting Integration Config Details",
        "1",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Accounting Integration Config Details",
      ),
    }),
});

const AccountingIntegrationConfigUpdateSchema =
  AccountingIntegrationConfigCreateSchema.keys({
    id: idRequired("Accounting Integration Config Id"),
    accountingIntegrationConfigDetails: Joi.array()
      .items(AccountingIntegrationConfigDetailsUpdateSchema)
      .min(1)
      .required()
      .messages({
        "array.base": generateValidationErrorMessage(
          "INVALID",
          "Accounting Integration Config Details",
        ),
        "array.min": generateValidationErrorMessage(
          "ARRAY_MIN_LENGTH",
          "Accounting Integration Config Details",
          "1",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Accounting Integration Config Details",
        ),
      }),
  });

export const validateCreateAccountingIntegrationConfig = validationHandler({
  schema: AccountingIntegrationConfigCreateSchema,
});

export const validateUpdateAccountingIntegrationConfig = validationHandler({
  schema: AccountingIntegrationConfigUpdateSchema,
});
