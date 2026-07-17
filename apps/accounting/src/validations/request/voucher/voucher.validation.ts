import { PaymentMode } from "@/types/voucher/voucher.js";
import { joiDecimalFromSettings } from "@/utils/helper.utils.js";
import {
  AllocationType,
  BankTransactionType,
  ConfigSubRefType,
  DrCr,
  VoucherReferenceType,
  VoucherStatus,
} from "@repo/db/generated/prisma/enums.js";
import {
  arrayOptional,
  arrayRequired,
  dateOptional,
  dateRequired,
  enumOptional,
  enumRequired,
  idOptional,
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

// transactionType BankTransactionType? @map("transaction_type")
// // Optional (helps statement printing & bank recon later)
// instrumentNo    String?              @map("instrument_no")
// instrumentDate  DateTime?            @map("instrument_date")
export const createVoucherLineSchema = Joi.object({
  lineNo: idRequired("Line No"),
  ledgerId: idRequired("Ledger Id"),
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
  description: strOptional("Description"),
  transactionType: enumOptional("Transaction Type", BankTransactionType),
  instrumentNo: Joi.when("transactionType", {
    is: Joi.exist().not(null),
    then: strRequired("Instrument No"),
    otherwise: strOptional("Instrument No"),
  }),
  instrumentDate: Joi.when("transactionType", {
    is: Joi.exist().not(null),
    then: dateRequired("Instrument Date"),
    otherwise: dateOptional("Instrument Date"),
  }),
});

export const updateVoucherLineSchema = createVoucherLineSchema.keys({
  id: idOptional("Voucher Line Id"),
});

export const postVoucherBillAllocationSchema = Joi.object({
  lineNo: idRequired("Line No"),
  partyLedgerId: idRequired("Party Ledger Id"),
  allocationType: enumRequired("Allocation Type", AllocationType),
  billDocumentId: idOptional("Bill Document Id").when("allocationType", {
    is: AllocationType.NEW_REF,
    then: Joi.valid(null).messages({
      "any.only": generateValidationErrorMessage(
        "ONLY_NULL",
        "Bill Document Id"
      ),
    }),
    otherwise: Joi.required().messages({
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Bill Document Id"
      ),
    }),
  }),

  refNo: strOptional("Reference No").when("allocationType", {
    is: AllocationType.NEW_REF,
    then: Joi.required().messages({
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Reference No"
      ),
    }),
    otherwise: Joi.valid(null).messages({
      "any.only": generateValidationErrorMessage("ONLY_NULL", "Reference No"),
    }),
  }),

  refDate: dateOptional("Reference Date").when("allocationType", {
    is: AllocationType.NEW_REF,
    then: Joi.date()
      .required()
      .messages({
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Reference Date"
        ),
      }),
    otherwise: Joi.valid(null).messages({
      "any.only": generateValidationErrorMessage("ONLY_NULL", "Reference Date"),
    }),
  }),
  dueDate: dateOptional("Due Date").allow(null),
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
});

export const postVoucherCostCenterAllocationSchema = Joi.object({
  lineNo: idRequired("Line No"),
  costCenterId: idRequired("Cost Center Id"),
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
});

export const createVoucherSchema = Joi.object({
  companyId: idRequired("Company Id"),
  financialYearId: idRequired("Financial Year Id"),
  ccId: idRequired("Collection Center Id"),
  voucherTypeId: idRequired("Voucher Type Id"),
  voucherNo: strOptional("Voucher No"),
  voucherDate: dateRequired("Voucher Date"),
  refNo: strOptional("Reference No"),
  refType: strOptional("Reference Type"),
  subRefType: enumOptional("Sub Reference Type", ConfigSubRefType),
  refId: idOptional("Reference Id"),
  pId: strOptional("P Id"),
  narration: strOptional("Narration"),
  status: enumRequired("Status", VoucherStatus),
  totalDebit: joiDecimalFromSettings({
    key: "roundingPrecision",
    required: true,
    min: 0,
  })
    .greater(0)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Total Debit"),
      "number.min": generateValidationErrorMessage(
        "NON_NEGATIVE",
        "Total Debit"
      ),
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Total Debit",
        "{{#limit}}"
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Total Debit"),
      "number.greater": generateValidationErrorMessage(
        "MUST_GREATER_THAN",
        "Total Debit",
        "0"
      ),
    }),
  totalCredit: joiDecimalFromSettings({
    key: "roundingPrecision",
    required: true,
    min: 0,
  })
    .greater(0)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Total Credit"),
      "number.min": generateValidationErrorMessage(
        "NON_NEGATIVE",
        "Total Credit"
      ),
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Total Credit",
        "{{#limit}}"
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Total Credit"
      ),
      "number.greater": generateValidationErrorMessage(
        "MUST_GREATER_THAN",
        "Total Credit",
        "0"
      ),
    }),
  currencyId: idOptional("Currency Id"),
  currencyConversionRate: joiDecimalFromSettings({
    key: "roundingPrecision",
    required: true,
    min: 0,
  })
    .allow(null)
    .messages({
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Currency Conversion Rate"
      ),
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Currency Conversion Rate"
      ),
      "number.min": generateValidationErrorMessage(
        "NON_NEGATIVE",
        "Currency Conversion Rate"
      ),
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Currency Conversion Rate",
        "{{#limit}}"
      ),
    }),
  voucherLines: arrayRequired("Voucher Lines", createVoucherLineSchema, 2),
  billAllocations: arrayOptional(
    "Bill Allocations",
    postVoucherBillAllocationSchema,
    0
  ),
  costCenterAllocations: arrayOptional(
    "Cost Center Allocations",
    postVoucherCostCenterAllocationSchema,
    0
  ),
});

export const updateVoucherSchema = createVoucherSchema.keys({
  id: idRequired("Voucher Id"),
  voucherLines: arrayRequired("Voucher Lines", updateVoucherLineSchema, 2),
});

const paymentInputSchema = Joi.object({
  paymentMode: enumRequired("Payment Mode", PaymentMode),
  bankOrCashId: idRequired("Bank Or Cash Id"),
  paymentAmount: joiDecimalFromSettings({
    key: "roundingPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": generateValidationErrorMessage("NUMBER", "Payment Amount"),
    "number.min": generateValidationErrorMessage(
      "NON_NEGATIVE",
      "Payment Amount"
    ),
    "number.precision": generateValidationErrorMessage(
      "PRECISION",
      "Payment Amount",
      "{{#limit}}"
    ),
    "any.required": generateValidationErrorMessage(
      "REQUIRED",
      "Payment Amount"
    ),
  }),
});

export const postExternalVoucherSchema = Joi.object({
  ccId: idRequired("Collection Center Id"),
  refType: enumRequired("Reference Type", VoucherReferenceType),
  refSubType: enumOptional("Reference Sub Type", ConfigSubRefType),
  refNo: strRequired("Reference No"),
  refId: idRequired("Reference Id"),
  refDate: dateRequired("Reference Date"),
  pId: strOptional("P Id"),
  currencyId: idOptional("Currency Id"),
  currencyConversionRate: Joi.when("currencyId", {
    is: Joi.exist().not(null),
    then: joiDecimalFromSettings({
      key: "roundingPrecision",
      required: true,
      min: 0,
    }).messages({
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Currency Conversion Rate"
      ),
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Currency Conversion Rate"
      ),
      "number.min": generateValidationErrorMessage(
        "NON_NEGATIVE",
        "Currency Conversion Rate"
      ),
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Currency Conversion Rate",
        "{{#limit}}"
      ),
    }),
    otherwise: joiDecimalFromSettings({
      key: "roundingPrecision",
      required: false,
      min: 0,
    })
      .allow(null)
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Currency Conversion Rate"
        ),
        "number.min": generateValidationErrorMessage(
          "NON_NEGATIVE",
          "Currency Conversion Rate"
        ),
        "number.precision": generateValidationErrorMessage(
          "PRECISION",
          "Currency Conversion Rate",
          "{{#limit}}"
        ),
      }),
  }),
  totalAmount: joiDecimalFromSettings({
    key: "roundingPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": generateValidationErrorMessage("NUMBER", "Total Amount"),
    "number.min": generateValidationErrorMessage(
      "NON_NEGATIVE",
      "Total Amount"
    ),
    "number.precision": generateValidationErrorMessage(
      "PRECISION",
      "Total Amount",
      "{{#limit}}"
    ),
    "any.required": generateValidationErrorMessage("REQUIRED", "Total Amount"),
  }),

  clientId: Joi.when("refSubType", {
    is: Joi.valid(ConfigSubRefType.INSURANCE, ConfigSubRefType.CORPORATE),
    then: idRequired("Client Id"),
    otherwise: Joi.valid(null).messages({
      "any.only": generateValidationErrorMessage("ONLY_NULL", "Client Id"),
    }),
  }),

  clientPayAmount: joiDecimalFromSettings({
    key: "roundingPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": generateValidationErrorMessage(
      "NUMBER",
      "Client Pay Amount"
    ),
    "number.min": generateValidationErrorMessage(
      "NON_NEGATIVE",
      "Client Pay Amount"
    ),
    "number.precision": generateValidationErrorMessage(
      "PRECISION",
      "Client Pay Amount",
      "{{#limit}}"
    ),
    "any.required": generateValidationErrorMessage(
      "REQUIRED",
      "Client Pay Amount"
    ),
  }),

  customerName: strOptional("Customer Name"),

  customerPayAmount: joiDecimalFromSettings({
    key: "roundingPrecision",
    required: true,
    min: 0,
  }).messages({
    "number.base": generateValidationErrorMessage(
      "NUMBER",
      "Customer Pay Amount"
    ),
    "number.min": generateValidationErrorMessage(
      "NON_NEGATIVE",
      "Customer Pay Amount"
    ),
    "number.precision": generateValidationErrorMessage(
      "PRECISION",
      "Customer Pay Amount",
      "{{#limit}}"
    ),
    "any.required": generateValidationErrorMessage(
      "REQUIRED",
      "Customer Pay Amount"
    ),
  }),

  createdBy: idRequired("Created By"),
  // remarks: Joi.when("refType", {
  //   is: Joi.valid(VoucherReferenceType.OPD_APPOINTMENT_RETURN, VoucherReferenceType.INVESTIGATION_RETURN),
  //   then: strRequired("Remarks"),
  //   otherwise: strOptional("Remarks"),
  // }),

  remarks: strOptional("Remarks"),
  payments: Joi.when("refType", {
    is: Joi.valid(
      VoucherReferenceType.PHARMACY_SELL_PAYMENT,
      VoucherReferenceType.PHARMACY_SELL_REFUND,
      VoucherReferenceType.PHARMACY_GRN_PAYMENT,
      VoucherReferenceType.PHARMACY_GRN_REFUND,
      VoucherReferenceType.PREPAID_CORPORATE_PAYMENT,
      VoucherReferenceType.POSTPAID_CORPORATE_PAYMENT,
      VoucherReferenceType.PREPAID_INSURANCE_PAYMENT,
      VoucherReferenceType.POSTPAID_INSURANCE_PAYMENT,
      VoucherReferenceType.PREPAID_CORPORATE_REFUND,
      VoucherReferenceType.POSTPAID_CORPORATE_REFUND,
      VoucherReferenceType.PREPAID_INSURANCE_REFUND,
      VoucherReferenceType.POSTPAID_INSURANCE_REFUND
    ),
    then: arrayRequired("Payments", paymentInputSchema, 1),
    otherwise: arrayOptional("Payments", paymentInputSchema, 0),
  }),
});

const createVoucherExcelSchema = Joi.object({
  ccId: idRequired("Collection Center Id"),
  voucherTypeId: idRequired("Voucher Type Id"),
  excelFile: strOptional("Excel File"),
});

const voucherExcelExportSchema = Joi.object({
  voucherTypeId: idRequired("Voucher Type Id"),
});

/**Middlewares Validation Functions */
export const validateCreateVoucher = validationHandler({
  schema: createVoucherSchema,
});

export const validateUpdateVoucher = validationHandler({
  schema: updateVoucherSchema,
});

export const validatePostExternalVoucher = validationHandler({
  schema: postExternalVoucherSchema,
});

export const validateCreateVoucherExcel = validationHandler({
  schema: createVoucherExcelSchema,
  path: "body",
  type: "FORMDATA",
  imgAttr: "excelFile",
});

export const validateExportVoucherExcel = validationHandler({
  schema: voucherExcelExportSchema,
});
