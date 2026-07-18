import { CreateOrUpdateVoucherUINConfigRequest } from "@/types/master/voucherUinConfig.js";
import {
  AccUinShortCode,
  UIN_RESET_POLICY,
} from "@repo/db/generated/prisma/enums.js";
import { dateRequired, idRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { UINPreviewRequest, UINSegment } from "av6-core-v2";
import Joi from "joi";

const UINSegmentSchema = Joi.object<UINSegment>({
  order: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Order"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Order"),
      "number.min": generateValidationErrorMessage("MIN_VALUE", "Order", "1"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Order"),
    }),

  type: Joi.string()
    .valid("text", "separator", "dateFormat", "sequenceNo")
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Type"),
      "any.only":
        "Type must be one of [text, separator, dateFormat, sequenceNo]",
      "any.required": generateValidationErrorMessage("REQUIRED", "Type"),
    }),

  // If type is 'text' | 'separator' | 'dateFormat', then 'value' is required.
  // Otherwise (sequenceNo), 'value' must NOT be provided.
  value: Joi.when("type", {
    is: Joi.valid("text", "separator", "dateFormat"),
    then: Joi.string()
      .trim()
      .required()
      .messages({
        "string.base": generateValidationErrorMessage("STRING", "Value"),
        "string.empty": generateValidationErrorMessage("EMPTY", "Value"),
        "any.required": generateValidationErrorMessage("REQUIRED", "Value"),
      }),
    otherwise: Joi.forbidden().messages({
      "any.unknown": generateValidationErrorMessage("FORBIDDEN", "Value"),
    }),
  }),

  // If type is 'sequenceNo', then 'minSeqLength' is required.
  // Otherwise, minSeqLength must NOT be provided.
  minSeqLength: Joi.when("type", {
    is: "sequenceNo",
    then: Joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Min Sequence Length"
        ),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Min Sequence Length"
        ),
        "number.min": generateValidationErrorMessage(
          "MIN",
          "Min Sequence Length",
          "1"
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Min Sequence Length"
        ),
      }),
    otherwise: Joi.forbidden().messages({
      "any.unknown": generateValidationErrorMessage(
        "FORBIDDEN",
        "Min Sequence Length"
      ),
    }),
  }),
});

export const createVoucherUINConfigSchema =
  Joi.object<CreateOrUpdateVoucherUINConfigRequest>({
    voucherTypeId: idRequired("Voucher Type Id"),
    seqStartDate: dateRequired("Sequence Start Date"),
    seqResetPolicy: Joi.string()
      .valid(...Object.values(UIN_RESET_POLICY))
      .required()
      .messages({
        "string.base": generateValidationErrorMessage(
          "STRING",
          "Sequence Reset Policy"
        ),
        "any.only": `Sequence Reset Policy must be one of [${Object.values(
          UIN_RESET_POLICY
        ).join(", ")}]`,
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Sequence Reset Policy"
        ),
      }),

    description: Joi.string()
      .trim()
      .optional()
      .allow(null, "")
      .messages({
        "string.base": generateValidationErrorMessage("STRING", "Description"),
      }),

    uinSegments: Joi.array()
      .items(UINSegmentSchema)
      .min(1)
      .required()
      .messages({
        "array.base": generateValidationErrorMessage("ARRAY", "UIN Segments"),
        "array.min": generateValidationErrorMessage("MIN", "UIN Segments"),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "UIN Segments"
        ),
      }),
  });

export const updateVoucherUINConfigSchema = createVoucherUINConfigSchema.keys({
  id: idRequired("Id"),
});

/**
 * Schema for UINPreviewRequest (previewCustom).
 */
export const previewConfigSchema = Joi.object<UINPreviewRequest>({
  uinSegments: Joi.array()
    .items(UINSegmentSchema)
    .min(1)
    .required()
    .messages({
      "array.base": generateValidationErrorMessage("ARRAY", "UIN Segments"),
      "array.min": generateValidationErrorMessage("MIN", "UIN Segments"),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "UIN Segments"
      ),
    }),
});

export const uinShortCodeSchema = Joi.object({
  shortCode: Joi.string()
    .valid(...Object.values(AccUinShortCode))
    .trim()
    .min(1)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Short Code"),
      "string.empty": generateValidationErrorMessage("EMPTY", "Short Code"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Short Code"),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Short Code",
        Object.values(AccUinShortCode).join(", ")
      ),
    }),
});

export const validateCreateVoucherUINConfig = validationHandler({
  schema: createVoucherUINConfigSchema,
});
export const validateUpdateVoucherUINConfig = validationHandler({
  schema: updateVoucherUINConfigSchema,
});

export const validateGetVoucherUINConfig = validationHandler({
  schema: uinShortCodeSchema,
});

export const validatePreviewVoucherUINConfig = validationHandler({
  schema: previewConfigSchema,
});
