import {
  UIN_RESET_POLICY,
  InvUinShortCode,
} from "@repo/db/generated/prisma/client";
import { UINPreviewRequest, UINSegment } from "av6-core";
import Joi from "joi";
import {
  arrayRequired,
  enumRequired,
  forbiddenField,
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const UINPartType = {
  TEXT: "text",
  SEPARATOR: "separator",
  DATE_FORMAT: "dateFormat",
  SEQUENCE_NO: "sequenceNo",
} as const;

/**
 * Schema for a single UINSegment.
 */
const UINSegmentSchema = Joi.object<UINSegment>({
  order: idRequired("Order", 1),

  type: enumRequired("Type", UINPartType),

  // If type is 'text' | 'separator' | 'dateFormat', then 'value' is required.
  // Otherwise (sequenceNo), 'value' must NOT be provided.
  value: Joi.when("type", {
    is: Joi.valid(
      UINPartType.TEXT,
      UINPartType.SEPARATOR,
      UINPartType.DATE_FORMAT,
    ),
    then: strRequired("Value"),
    otherwise: forbiddenField("Value"),
  }),

  // If type is 'sequenceNo', then 'minSeqLength' is required.
  // Otherwise, minSeqLength must NOT be provided.
  minSeqLength: Joi.when("type", {
    is: UINPartType.SEQUENCE_NO,
    then: idRequired("Min Sequence Length", 1),
    otherwise: forbiddenField("Min Sequence Length"),
  }),
});

/**
 * Schema for CreateUINConfigRequest.
 */
export const createUINConfigSchema = Joi.object({
  shortCode: enumRequired("Short Code", InvUinShortCode),

  seqResetPolicy: enumRequired("Sequence Reset Policy", UIN_RESET_POLICY),

  description: strOptional("Description"),

  uinSegments: arrayRequired("UIN Segments", UINSegmentSchema, 1),
});

/**
 * Schema for UpdateUINConfigRequest.
 * Exactly the same as create, but with an additional 'id' field.
 */

export const updateUINConfigSchema = createUINConfigSchema.keys({
  id: idRequired("Id"),
});

/**
 * Schema for UINPreviewRequest (previewCustom).
 */
export const previewConfigSchema = Joi.object<UINPreviewRequest>({
  uinSegments: arrayRequired("UIN Segments", UINSegmentSchema, 1),
});

export const uinShortCodeSchema = Joi.object({
  shortCode: enumRequired("Short Code", InvUinShortCode),
});

export const validateCreateConfig = validationHandler({
  schema: createUINConfigSchema,
});

export const validateUpdateConfig = validationHandler({
  schema: updateUINConfigSchema,
});

export const validateGetUINConfig = validationHandler({
  schema: uinShortCodeSchema,
});

export const validatePreviewCustomConfig = validationHandler({
  schema: previewConfigSchema,
});
