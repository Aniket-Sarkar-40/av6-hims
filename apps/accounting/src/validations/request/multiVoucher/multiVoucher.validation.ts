import { joiDecimalFromSettings } from "@/utils/helper.utils.js";
import {
  BankTransactionType,
  DrCr,
  MultiVoucherStatus,
} from "@repo/db/generated/prisma/enums.js";
import {
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

export const createMultiVoucherDetailsSchema = Joi.object({
  lineNo: idRequired("Line No"),
  ccId: idRequired("Collection Center Id"),
  voucherNo: strOptional("Voucher No"),
  ledgerId: idRequired("Ledger Id"),
  drCr: enumRequired("Dr Cr", DrCr),
  amount: joiDecimalFromSettings({
    key: "roundingPrecision",
    required: true,
    min: 0,
  })
    .greater(0)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Amount"),
      "number.min": generateValidationErrorMessage("NON_NEGATIVE", "Amount"),
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Amount",
        "{{#limit}}",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Amount"),
      "number.greater": generateValidationErrorMessage(
        "MUST_GREATER_THAN",
        "Details Amount",
        "0",
      ),
    }),
  narration: strOptional("Narration"),
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

export const updateMultiVoucherDetailsSchema =
  createMultiVoucherDetailsSchema.keys({
    id: idOptional("Id"),
  });

export const updatePostedMultiVoucherDetailsSchema =
  updateMultiVoucherDetailsSchema.keys({
    voucherId: idRequired("Voucher Id"),
  });

export const createMultiVoucherSchema = Joi.object({
  ccId: idRequired("Collection Center Id"),
  companyId: idRequired("Company Id"),
  financialYearId: idRequired("Financial Year Id"),
  voucherTypeId: idRequired("Voucher Type Id"),
  voucherDate: dateRequired("Voucher Date"),
  description: strOptional("Description"),
  status: enumRequired("Status", MultiVoucherStatus),
  ledgerId: idRequired("Ledger Id"),
  drCr: enumRequired("Dr Cr", DrCr),
  amount: joiDecimalFromSettings({
    key: "roundingPrecision",
    required: true,
    min: 0,
  })
    .greater(0)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Amount"),
      "number.min": generateValidationErrorMessage("NON_NEGATIVE", "Amount"),
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Amount",
        "{{#limit}}",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Amount"),
      "number.greater": generateValidationErrorMessage(
        "MUST_GREATER_THAN",
        "Header Amount",
        "0",
      ),
    }),
  multiVoucherDetails: arrayRequired(
    "Multi Voucher Details",
    createMultiVoucherDetailsSchema,
    1,
  ),
})
  .custom((value, helpers) => {
    const { multiVoucherDetails, ledgerId } = value;

    /**
     * Unique lineNo validation
     */
    const lineNos = multiVoucherDetails.map(
      (detail: { lineNo: number }) => detail.lineNo,
    );
    const uniqueLineNos = new Set(lineNos);
    if (uniqueLineNos.size !== lineNos.length) {
      return helpers.error("any.custom", {
        message: "Each Multi Voucher Detail must have a unique Line No.",
      });
    }

    /**
     * Unique ccId validation
     */
    // const ccIds = multiVoucherDetails.map((detail: { ccId: number }) => detail.ccId);
    // const uniqueIds = new Set(ccIds);
    // if (uniqueIds.size !== ccIds.length) {
    //   return helpers.error("any.custom", {
    //     message: "Each Multi Voucher Detail must have a unique Collection Center Id (ccId).",
    //   });
    // }

    /**
     * Detail ledger cannot be same as header ledger
     */
    const hasSameLedger = multiVoucherDetails.some(
      (detail: { ledgerId: number }) => detail.ledgerId === ledgerId,
    );

    if (hasSameLedger) {
      return helpers.error("any.custom", {
        message: "Details Ledger cannot be same as Header Ledger.",
      });
    }

    /**
     * Opposite drCr validation
     */
    // const oppositeDrCr = drCr === DrCr.DR ? DrCr.CR : DrCr.DR;

    // for (const [idx, detail] of multiVoucherDetails.entries()) {
    //   if (detail.drCr !== oppositeDrCr) {
    //     return helpers.error("any.custom", {
    //       message: `Multi Voucher Details row #${idx + 1}: 'drCr' must be '${oppositeDrCr}'.`,
    //     });
    //   }
    // }

    return value;
  })
  .messages({
    "any.custom": "{{#message}}",
  });

export const updateMultiVoucherSchema = createMultiVoucherSchema.keys({
  id: idRequired("Id"),
  multiVoucherDetails: arrayRequired(
    "Multi Voucher Details",
    updateMultiVoucherDetailsSchema,
    1,
  ),
});

export const updatePostedMultiVoucherSchema = createMultiVoucherSchema.keys({
  id: idRequired("Id"),
  multiVoucherDetails: arrayRequired(
    "Multi Voucher Details",
    updatePostedMultiVoucherDetailsSchema,
    1,
  ),
});
export const validateCreateMultiVoucher = validationHandler({
  schema: createMultiVoucherSchema,
});
export const validateUpdateMultiVoucher = validationHandler({
  schema: updateMultiVoucherSchema,
});
export const validateUpdatePostedMultiVoucher = validationHandler({
  schema: updatePostedMultiVoucherSchema,
});
