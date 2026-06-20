import { joiDecimalFromSettings } from "@/utils/helper.utils.js";
import {
  DrCr,
  LedgerGstType,
  LedgerType,
} from "@repo/db/generated/prisma/enums.js";
import {
  boolRequired,
  dateRequired,
  emailOptional,
  enumRequired,
  idOptional,
  idRequired,
  phoneOptional,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

const LedgerOpeningBalanceCreateSchema = Joi.object({
  financialYearId: idRequired("Financial Year Id"),
  asOnDate: dateRequired("As On Date"),
  drCr: enumRequired("Dr Cr", DrCr),
  amount: joiDecimalFromSettings({
    key: "roundingPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": generateValidationErrorMessage("NUMBER", "Amount"),
    "number.min": generateValidationErrorMessage("NON_NEGATIVE", "Amount"),
    "number.precision": generateValidationErrorMessage(
      "PRECISION",
      "Amount",
      "{{#limit}}"
    ),
    "any.required": generateValidationErrorMessage("REQUIRED", "Amount"),
  }),
  source: strOptional("Source"),
  note: strOptional("Note"),
});

const LedgerOpeningBalanceUpdateSchema = LedgerOpeningBalanceCreateSchema.keys({
  id: idOptional("Opening Balance Id"),
});

export const LedgerCreateSchema = Joi.object({
  companyId: idRequired("Company Id"),
  groupId: idRequired("Group Id"),
  name: strRequired("Ledger Name"),
  alias: strOptional("Alias"),
  ledgerType: enumRequired("Ledger Type", LedgerType),
  isBillWiseOn: boolRequired("Bill Wise Tracking"),
  isCostCentreOn: boolRequired("Cost Centre"),

  isBankAccount: boolRequired("Bank Account"),
  isCashAccount: boolRequired("Cash Account"),

  isReserved: boolRequired("Reserved"),

  bankName: Joi.string().when("isBankAccount", {
    is: true,
    then: Joi.required().messages({
      "any.required": generateValidationErrorMessage("REQUIRED", "Bank Name"),
    }),
    otherwise: Joi.forbidden().messages({
      "any.unknown": generateValidationErrorMessage("FORBIDDEN", "Bank Name"),
    }),
  }),
  bankIfsc: Joi.string().when("isBankAccount", {
    is: true,
    then: Joi.required().messages({
      "any.required": generateValidationErrorMessage("REQUIRED", "Bank IFSC"),
    }),
    otherwise: Joi.forbidden().messages({
      "any.unknown": generateValidationErrorMessage("FORBIDDEN", "Bank IFSC"),
    }),
  }),
  bankAccountNo: Joi.string().when("isBankAccount", {
    is: true,
    then: Joi.required().messages({
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Bank Account No"
      ),
    }),
    otherwise: Joi.forbidden().messages({
      "any.unknown": generateValidationErrorMessage(
        "FORBIDDEN",
        "Bank Account No"
      ),
    }),
  }),
  upiId: Joi.string().when("isBankAccount", {
    is: true,
    then: Joi.optional(),
    otherwise: Joi.forbidden().messages({
      "any.unknown": generateValidationErrorMessage("FORBIDDEN", "UPI Id"),
    }),
  }),

  contactName: strOptional("Contact Name"),
  phone: phoneOptional("Phone"),
  email: emailOptional("Email"),
  address: strOptional("Address"),

  gstType: enumRequired("GST Type", LedgerGstType),
  gstin: Joi.string().when("gstType", {
    is: [
      LedgerGstType.REGISTERED,
      LedgerGstType.COMPOSITION,
      LedgerGstType.SEZ,
    ],
    then: Joi.required().messages({
      "any.required": generateValidationErrorMessage("REQUIRED", "GSTIN"),
    }),
    otherwise: Joi.optional(),
  }),

  placeOfSupplyStateId: Joi.number().when("gstType", {
    is: [
      LedgerGstType.REGISTERED,
      LedgerGstType.COMPOSITION,
      LedgerGstType.SEZ,
    ],
    then: Joi.required().messages({
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Place of Supply State"
      ),
    }),
    otherwise: Joi.forbidden().messages({
      "any.unknown": generateValidationErrorMessage(
        "FORBIDDEN",
        "Place of Supply State"
      ),
    }),
  }),

  ledgerOpeningBalance: LedgerOpeningBalanceCreateSchema.optional(),
});

const LedgerUpdateSchema = LedgerCreateSchema.keys({
  id: idRequired("Ledger Id"),
  ledgerOpeningBalance: LedgerOpeningBalanceUpdateSchema.optional(),
});

export const validateCreateLedger = validationHandler({
  schema: LedgerCreateSchema,
});

export const validateUpdateLedger = validationHandler({
  schema: LedgerUpdateSchema,
});
