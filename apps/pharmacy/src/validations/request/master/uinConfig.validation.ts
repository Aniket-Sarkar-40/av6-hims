import {
  CreateUINConfigRequest,
  UINPreviewRequest,
  UINSegment,
  UpdateUINConfigRequest,
} from "@/types/master/uinConfig.js";
import {
  PmsUinShortCode,
  UIN_RESET_POLICY,
} from "@repo/db/generated/prisma/enums.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

/**
 * Schema for a single UINSegment.
 */
const UINSegmentSchema = Joi.object<UINSegment>({
  order: Joi.number().integer().min(1).required().messages({
    "number.base": "Order must be a number",
    "number.integer": "Order must be an integer",
    "number.min": "Order must be at least 1",
    "any.required": "Order is required",
  }),

  type: Joi.string()
    .valid("text", "separator", "dateFormat", "sequenceNo")
    .required()
    .messages({
      "string.base": "Type must be a string",
      "any.only":
        "Type must be one of [text, separator, dateFormat, sequenceNo]",
      "any.required": "Type is required",
    }),

  // If type is 'text' | 'separator' | 'dateFormat', then 'value' is required.
  // Otherwise (sequenceNo), 'value' must NOT be provided.
  value: Joi.when("type", {
    is: Joi.valid("text", "separator", "dateFormat"),
    then: Joi.string().trim().required().messages({
      "string.base": "Value must be a string",
      "string.empty": "Value cannot be empty",
      "any.required":
        "Value is required when type is text, separator, or dateFormat",
    }),
    otherwise: Joi.forbidden().messages({
      "any.unknown": "Value must not be provided when type is sequence no",
    }),
  }),

  // If type is 'sequenceNo', then 'minSeqLength' is required.
  // Otherwise, minSeqLength must NOT be provided.
  minSeqLength: Joi.when("type", {
    is: "sequenceNo",
    then: Joi.number().integer().min(1).required().messages({
      "number.base": "Min Sequence Length must be a number",
      "number.integer": "Min Sequence Length must be an integer",
      "number.min": "Min Sequence Length must be at least 1",
      "any.required":
        "Min Sequence Length is required when type is sequence no",
    }),
    otherwise: Joi.forbidden().messages({
      "any.unknown":
        "Min Sequence Length must not be provided unless type is sequenceNo",
    }),
  }),
});

/**
 * Schema for CreateUINConfigRequest.
 */
export const createUINConfigSchema = Joi.object<CreateUINConfigRequest>({
  shortCode: Joi.string()
    .valid(...Object.values(PmsUinShortCode))
    .trim()
    .min(1)
    .required()
    .messages({
      "string.base": "Short Code must be a string",
      "string.empty": "Short Code cannot be empty",
      "any.required": "shortShort CodeCode is required",
      "any.only": `Status must be one of ${Object.values(PmsUinShortCode).join(", ")}`,
    }),

  seqResetPolicy: Joi.string()
    .valid(...Object.values(UIN_RESET_POLICY))
    .required()
    .messages({
      "string.base": "Sequence Reset Policy must be a string",
      "any.only": `Sequence Reset Policy must be one of [${Object.values(UIN_RESET_POLICY).join(", ")}]`,
      "any.required": "Sequence Reset Policy is required",
    }),

  description: Joi.string().trim().optional().allow(null, "").messages({
    "string.base": "Description must be a string",
  }),

  uinSegments: Joi.array().items(UINSegmentSchema).min(1).required().messages({
    "array.base": "Uin Segments must be an array",
    "array.min": "Uin Segments must contain at least one segment",
    "any.required": "Uin Segments is required",
  }),
});

/**
 * Schema for UpdateUINConfigRequest.
 * Exactly the same as create, but with an additional 'id' field.
 */
export const updateUINConfigSchema = Joi.object<UpdateUINConfigRequest>({
  id: Joi.number().integer().min(1).required().messages({
    "number.base": "Id must be a number",
    "number.integer": "Id must be an integer",
    "number.min": "Id must be at least 1",
    "any.required": "Id is required",
  }),

  shortCode: Joi.string()
    .valid(...Object.values(PmsUinShortCode))
    .trim()
    .min(1)
    .required()
    .messages({
      "string.base": "Short Code must be a string",
      "string.empty": "Short Code cannot be empty",
      "any.required": "Short Code is required",
      "any.only": `Status must be one of ${Object.values(PmsUinShortCode).join(", ")}`,
    }),

  seqResetPolicy: Joi.string()
    .valid(...Object.values(UIN_RESET_POLICY))
    .required()
    .messages({
      "string.base": "Sequence Reset Policy must be a string",
      "any.only": `Sequence Reset Policy must be one of [${Object.values(UIN_RESET_POLICY).join(", ")}]`,
      "any.required": "Sequence Reset Policy is required",
    }),

  description: Joi.string().trim().optional().allow(null, "").messages({
    "string.base": "Description must be a string",
  }),

  uinSegments: Joi.array().items(UINSegmentSchema).min(1).required().messages({
    "array.base": "Uin Segments must be an array",
    "array.min": "Uin Segments must contain at least one segment",
    "any.required": "Uin Segments is required",
  }),
});

/**
 * Schema for UINPreviewRequest (previewCustom).
 */
export const previewConfigSchema = Joi.object<UINPreviewRequest>({
  uinSegments: Joi.array().items(UINSegmentSchema).min(1).required().messages({
    "array.base": "Uin Segments must be an array",
    "array.min": "Uin Segments must contain at least one segment",
    "any.required": "Uin Segments is required",
  }),
});

export const uinShortCodeSchema = Joi.object({
  shortCode: Joi.string()
    .valid(...Object.values(PmsUinShortCode))
    .trim()
    .min(1)
    .required()
    .messages({
      "string.base": "Short Code must be a string",
      "string.empty": "Short Code cannot be empty",
      "any.required": "Short Code is required",
      "any.only": `Status must be one of ${Object.values(PmsUinShortCode).join(", ")}`,
    }),
});

export const validateCreateConfig = (
  req: Request,
  res: Response,
  next: NextFunction,
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
      }),
    );
  }

  next();
};

export const validateUpdateConfig = (
  req: Request,
  res: Response,
  next: NextFunction,
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
      }),
    );
  }

  next();
};
export const validateGetUINConfig = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error } = uinShortCodeSchema.validate(req.query, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json(
      new BaseResponse({
        success: false,
        errorCode: "PARAMETER_INVALID",
        errorMessage: error.message,
        errors: error.details,
      }),
    );
  }

  next();
};

export const validatePreviewCustomConfig = (
  req: Request,
  res: Response,
  next: NextFunction,
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
      }),
    );
  }

  next();
};
