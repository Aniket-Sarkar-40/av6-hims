import {
  boolRequired,
  idRequired,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const createFeatureFlagSchema = Joi.object({
  shortCode: strRequired("Short Code"),
  flagName: strRequired("Flag Name"),
  isEnabled: boolRequired("Is Enabled"),
  description: strRequired("Description"),
  featureConfig: Joi.any().optional().allow("", null).messages({
    "any.required": `Feature Config is not required`,
  }),
});

export const updateFeatureFlagSchema = createFeatureFlagSchema.keys({
  id: idRequired("ID"),
});

export const validateCreateFeatureFlag = validationHandler({
  schema: createFeatureFlagSchema,
});

export const validateUpdateFeatureFlag = validationHandler({
  schema: updateFeatureFlagSchema,
});
