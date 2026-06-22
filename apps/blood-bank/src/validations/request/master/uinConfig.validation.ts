import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  UIN_RESET_POLICY,
  BloodBankUinShortCode,
} from "@repo/db/generated/prisma/client";
import {
  CreateUINConfigRequest,
  UINPreviewRequest,
  UINSegment,
  UpdateUINConfigRequest,
} from "av6-core-v2";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

/**
 * Schema for a single UINSegment.
 */
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

/**
 * Schema for CreateUINConfigRequest.
 */
export const createUINConfigSchema = Joi.object<CreateUINConfigRequest>({
  shortCode: Joi.string()
    .valid(...Object.values(BloodBankUinShortCode))
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
        Object.values(BloodBankUinShortCode).join(", ")
      ),
    }),

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

/**
 * Schema for UpdateUINConfigRequest.
 * Exactly the same as create, but with an additional 'id' field.
 */
export const updateUINConfigSchema = Joi.object<UpdateUINConfigRequest>({
  id: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Id"),
      "number.integer": generateValidationErrorMessage("INTEGER", "Id"),
      "number.min": generateValidationErrorMessage("MIN", "Id"),
      "any.required": generateValidationErrorMessage("REQUIRED", "Id"),
    }),

  shortCode: Joi.string()
    .valid(...Object.values(BloodBankUinShortCode))
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
        Object.values(BloodBankUinShortCode).join(", ")
      ),
    }),

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

export const OpdUinShortCodeSchema = Joi.object({
  shortCode: Joi.string()
    .valid(...Object.values(BloodBankUinShortCode))
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
        Object.values(BloodBankUinShortCode).join(", ")
      ),
    }),
});

export const validateCreateConfig = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = createUINConfigSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      })
    );
  }

  next();
};

export const validateUpdateConfig = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = updateUINConfigSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      })
    );
  }

  next();
};
export const validateGetUINConfig = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = OpdUinShortCodeSchema.validate(req.query, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      })
    );
  }

  next();
};

export const validatePreviewCustomConfig = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = previewConfigSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      })
    );
  }

  next();
};
