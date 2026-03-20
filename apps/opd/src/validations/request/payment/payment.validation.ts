import {
  CreatePaymentInput,
  GetPaymentDetailsReq,
  GetPaymentReq,
  PaymentDetailInput,
} from "@/types/payment/payment.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  ServiceCode,
  PaymentStatus,
  PaymentTransactionMode,
  TransactionType,
} from "@repo/db/generated/prisma/client";
import Joi from "joi";

/*=============== Fetch Payment Schema =================*/
export const getPaymentSchema = Joi.object<GetPaymentReq>({
  ccId: Joi.number()
    .integer()
    .positive()
    .strict()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "CC Id"),
      "number.integer": generateValidationErrorMessage("INTEGER", "CC Id"),
      "number.positive": generateValidationErrorMessage("POSITIVE", "CId"),
      "any.required": generateValidationErrorMessage("REQUIRED", "CC  Id"),
    }),

  pageNo: Joi.number()
    .integer()
    .positive()
    .strict()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Page No"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Page No"),
      "number.positive": generateValidationErrorMessage("POSITIVE", "Page No"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Page No"),
    }),
  pageSize: Joi.number()
    .integer()
    .positive()
    .strict()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Page Size"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Page Size"),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Page Size",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Page Size"),
    }),
  paymentStatus: Joi.string()
    .valid(...Object.values(PaymentStatus))
    .required()
    .trim()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Payment Status"),
      "string.empty": generateValidationErrorMessage("EMPTY", "Payment Status"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Payment Status",
      ),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Payment Status",
        Object.values(PaymentStatus).join(", "),
      ),
    }),
  sortBy: Joi.string()
    .valid("ASC", "DESC")
    .trim()
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Sort By"),
      "string.empty": generateValidationErrorMessage("EMPTY", "Sort By"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Sort By"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Sort By",
        "ASC, DESC",
      ),
    }),
  searchText: Joi.string()
    .allow("")
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Search Text"),
    }),
  startDate: Joi.string()
    .isoDate()
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Start Date"),
      "string.empty": generateValidationErrorMessage("EMPTY", "Start Date"),
      "string.isoDate": generateValidationErrorMessage("DATE", "Start Date"),
    }),
  endDate: Joi.string()
    .isoDate()
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "End Date"),
      "string.empty": generateValidationErrorMessage("EMPTY", "End Date"),
      "string.isoDate": generateValidationErrorMessage("DATE", "End Date"),
    }),
});

/*=============== Create Payment Schema =================*/

const paymentDetailSchema = Joi.object<PaymentDetailInput>({
  paymentMode: Joi.string()
    .valid(...Object.values(PaymentTransactionMode))
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Payment Mode"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Payment Mode",
        Object.values(PaymentTransactionMode).join(", "),
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Payment Mode",
      ),
    }),
  paidAmount: Joi.number()
    .min(0)
    .precision(2)
    .strict()
    .when(Joi.ref("/transactionType"), {
      is: TransactionType.CREDIT,
      then: Joi.required(),
      otherwise: Joi.valid(null),
    })
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Paid Amount"),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Paid Amount",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Paid Amount",
        "2",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Paid Amount"),
      "any.only": generateValidationErrorMessage("ONLY_NULL", "Paid Amount"),
    }),

  refundAmount: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .strict()
    .when(Joi.ref("/transactionType"), {
      is: TransactionType.DEBIT,
      then: Joi.required(),
      otherwise: Joi.valid(null),
    })
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Refund Amount"),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Refund Amount",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Refund Amount",
        "2",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Refund Amount",
      ),
      "any.only": generateValidationErrorMessage("ONLY_NULL", "Refund Amount"),
    }),

  // BANK_TRANSFER / CHEQUE FIELDS
  bankName: Joi.string()
    .when("paymentMode", {
      is: Joi.valid(
        PaymentTransactionMode.BANK_TRANSFER,
        PaymentTransactionMode.CHEQUE,
      ),
      then: Joi.required(),
      otherwise: Joi.valid(null),
    })
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Bank Name"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Bank Name"),
      "any.only": generateValidationErrorMessage("ONLY_NULL", "Bank Name"),
    }),
  accountNumber: Joi.string()
    .when("paymentMode", {
      is: Joi.valid(
        PaymentTransactionMode.BANK_TRANSFER,
        PaymentTransactionMode.CHEQUE,
      ),
      then: Joi.required(),
      otherwise: Joi.valid(null),
    })
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Account Number"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Account Number",
      ),
      "any.only": generateValidationErrorMessage("ONLY_NULL", "Account Number"),
    }),

  // CARD FIELDS
  cardNo: Joi.string()
    .when("paymentMode", {
      is: PaymentTransactionMode.CARD,
      then: Joi.required(),
      otherwise: Joi.valid(null),
    })
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Card Number"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Card Number"),
      "any.only": generateValidationErrorMessage("ONLY_NULL", "Card Number"),
    }),

  cardHolderName: Joi.string()
    .when("paymentMode", {
      is: PaymentTransactionMode.CARD,
      then: Joi.required(),
      otherwise: Joi.valid(null),
    })
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Card Holder Name",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Card Holder Name",
      ),
      "any.only": generateValidationErrorMessage(
        "ONLY_NULL",
        "Card Holder Name",
      ),
    }),

  cardExpiryDate: Joi.date()
    .when("paymentMode", {
      is: PaymentTransactionMode.CARD,
      then: Joi.required(),
      otherwise: Joi.valid(null),
    })
    .messages({
      "date.base": generateValidationErrorMessage("DATE", "Card Expiry Date"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Card Expiry Date",
      ),
      "any.only": generateValidationErrorMessage(
        "ONLY_NULL",
        "Card Expiry Date",
      ),
    }),

  // ONLINE / UPI / WALLET FIELDS
  transactionId: Joi.string()
    .when("paymentMode", {
      is: Joi.valid(
        PaymentTransactionMode.ONLINE_GATEWAY,
        PaymentTransactionMode.UPI,
        PaymentTransactionMode.WALLET,
      ),
      then: Joi.required(),
      otherwise: Joi.valid(null),
    })
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Transaction ID"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Transaction ID",
      ),
      "any.only": generateValidationErrorMessage("ONLY_NULL", "Transaction ID"),
    }),
  bankHeadId: Joi.number()
    .when("paymentMode", {
      is: Joi.valid(PaymentTransactionMode.CASH),
      then: Joi.valid(null),
      otherwise: Joi.required(),
    })
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Bank Head ID"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Bank Head ID",
      ),
      "any.only": generateValidationErrorMessage("ONLY_NULL", "Bank Head ID"),
    }),
  mobileMoneyMethodId: Joi.number()
    .when("paymentMode", {
      is: Joi.valid(
        PaymentTransactionMode.ONLINE_GATEWAY,
        PaymentTransactionMode.UPI,
        PaymentTransactionMode.WALLET,
      ),
      then: Joi.required(),
      otherwise: Joi.valid(null),
    })
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Mobile Money Method ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Mobile Money Method ID",
      ),
      "any.only": generateValidationErrorMessage(
        "ONLY_NULL",
        "Mobile Money Method ID",
      ),
    }),
});
export const createPaymentSchema = Joi.object<CreatePaymentInput>({
  module: Joi.string()
    .valid(...Object.values(ServiceCode))
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Module"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Module",
        Object.values(ServiceCode).join(", "),
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Module"),
    }),

  referenceId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Reference ID"),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Reference ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Reference ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Reference ID",
      ),
    }),

  ccId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Collection Center ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Collection Center ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Collection Center ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Collection Center ID",
      ),
    }),

  totalPaidAmount: Joi.number()
    .min(0)
    .precision(2)
    .strict()
    .when("transactionType", {
      is: Joi.valid(TransactionType.CREDIT),
      then: Joi.required(),
      otherwise: Joi.valid(null),
    })
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Total Paid Amount",
      ),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Total Paid Amount",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Total Paid Amount",
        "2",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Total Paid Amount",
      ),
      "any.only": generateValidationErrorMessage(
        "ONLY_NULL",
        "Total Paid Amount",
      ),
    }),
  totalRefundAmount: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .strict()
    .when("transactionType", {
      is: Joi.valid(TransactionType.DEBIT),
      then: Joi.required(),
      otherwise: Joi.valid(null),
    })
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Total Refund Amount",
      ),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Total Refund Amount",
        "0",
      ),
      "number.precision": generateValidationErrorMessage(
        "DECIMAL",
        "Total Refund Amount",
        "2",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Total Refund Amount",
      ),
      "any.only": generateValidationErrorMessage(
        "ONLY_NULL",
        "Total Refund Amount",
      ),
    }),

  remarks: Joi.string()
    .optional()
    .allow(null, "")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Remarks"),
    }),

  transactionType: Joi.string()
    .valid(...Object.values(TransactionType))
    .required()
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Transaction Type",
      ),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Payment Mode",
        Object.values(TransactionType).join(", "),
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Transaction Type",
      ),
    }),
  details: Joi.array()
    .items(paymentDetailSchema)
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage("ARRAY", "Details"),
      "array.min": generateValidationErrorMessage(
        "ARRAY_MIN_LENGTH",
        "Details",
        "1",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Details"),
    }),
});

/*=============== Fetch payment details module wise Schema =================*/

export const getPaymentDetailsModuleWiseSchema =
  Joi.object<GetPaymentDetailsReq>({
    module: Joi.string()
      .valid(...Object.values(ServiceCode))
      .required()
      .messages({
        "string.base": generateValidationErrorMessage("STRING", "Module"),
        "any.required": generateValidationErrorMessage("REQUIRED", "Module"),
        "any.only": generateValidationErrorMessage(
          "VALID_ENUM",
          "Module",
          Object.values(ServiceCode).join(", "),
        ),
      }),
    id: Joi.number()
      .positive()
      .integer()
      .strict()
      .required()
      .messages({
        "number.base": generateValidationErrorMessage("NUMBER", "Id"),
        "any.required": generateValidationErrorMessage("REQUIRED", "Id"),
      }),
  });

export const validateGetPayment = validationHandler({
  schema: getPaymentSchema,
});
export const validateCreatePayment = validationHandler({
  schema: createPaymentSchema,
});
export const validateGetPaymentDetailsWithModule = validationHandler({
  schema: getPaymentDetailsModuleWiseSchema,
});
