import { CommonActiveInactiveParams } from "@/types/common.js";
import {
  idRequired,
  modelFieldRequired,
  scalarValueRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { SHORT_CODE } from "@repo/shared/utils/shortCode/inventory.shortCode.utils.js";
import Joi from "joi";

export const commonActiveInactiveSchema =
  Joi.object<CommonActiveInactiveParams>({
    shortCode: Joi.string()
      .valid(...Object.values(SHORT_CODE))
      .required()
      .messages({
        "any.only": `Short code must be one of [${Object.values(
          SHORT_CODE,
        ).join(", ")}].`,
        "any.required": "Short code is required",
        "string.base": "Short code must be a string",
      }),
    id: idRequired("Id"),
    field: modelFieldRequired("Field"),
    value: scalarValueRequired("Value"),
  });

export const validateCommonActiveInactive = validationHandler({
  schema: commonActiveInactiveSchema,
});
