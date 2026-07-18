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
      "{{#limit}}",
    ),
    "any.required": generateValidationErrorMessage("REQUIRED", "Amount"),
  }),
  currencyConversionRate: joiDecimalFromSettings({
    key: "roundingPrecision",
    required: false,
  })
    .greater(0)
    .allow(null)
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Currency Conversion Rate",
      ),
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Currency Conversion Rate",
        "{{#limit}}",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Currency Conversion Rate",
      ),
      "number.greater": generateValidationErrorMessage(
        "MUST_GREATER_THAN",
        "Currency Conversion Rate",
        "0",
      ),
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

  bankName: Joi.when("isBankAccount", {
    is: true,
    then: strRequired("Bank Name"),
    otherwise: strOptional("Bank Name"),
  }),
  bankIfsc: Joi.when("isBankAccount", {
    is: true,
    then: strRequired("Bank IFSC"),
    otherwise: strOptional("Bank IFSC"),
  }),
  bankAccountNo: Joi.when("isBankAccount", {
    is: true,
    then: strRequired("Bank Account No"),
    otherwise: strOptional("Bank Account No"),
  }),
  upiId: strOptional("UPI Id"),

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
        "Place of Supply State",
      ),
    }),
    otherwise: Joi.forbidden().messages({
      "any.unknown": generateValidationErrorMessage(
        "FORBIDDEN",
        "Place of Supply State",
      ),
    }),
  }),

  currencyId: Joi.when("isBankAccount", {
    is: true,
    then: idRequired("Currency Id"),
    otherwise: idOptional("Currency Id"),
  }),
  creditPeriodInDays: Joi.number()
    .min(0)
    .max(365)
    .optional()
    .allow(null)
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Credit Period In Days",
      ),
      "number.min": generateValidationErrorMessage(
        "NUMBER_MIN",
        "Credit Period In Days",
        "0",
      ),
      "number.max": generateValidationErrorMessage(
        "NUMBER_MAX",
        "Credit Period In Days",
        "365",
      ),
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

const createLedgerExcelSchema = Joi.object({
  companyId: idRequired("Company Id"),
  excelFile: strOptional("Excel File"),
});

export const validateCreateLedgerExcel = validationHandler({
  schema: createLedgerExcelSchema,
  path: "body",
  type: "FORMDATA",
  imgAttr: "excelFile",
});
