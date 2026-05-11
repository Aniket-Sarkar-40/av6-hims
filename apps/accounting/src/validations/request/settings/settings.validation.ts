import { CreateOrUpdateSettings } from "@/types/settings/settings.js";
import {
  CalculationMethod,
  RoundFormat,
} from "@repo/db/generated/prisma/enums.js";
import { idOptional } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

import Joi from "joi";

export const settingsSchema = Joi.object<CreateOrUpdateSettings>({
  id: idOptional("Id"),
  calculationMethod: Joi.string()
    .trim()
    .valid(...Object.values(CalculationMethod))
    .required()
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Calculation Method"
      ),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Calculation Method",
        Object.values(CalculationMethod).join(", ")
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Calculation Method"
      ),
    }),
  roundingMethod: Joi.string()
    .trim()
    .valid(...Object.values(RoundFormat))
    .required()
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Rounding Method"
      ),
      "any.only": generateValidationErrorMessage(
        "VALID_ENUM",
        "Rounding Method",
        Object.values(RoundFormat).join(", ")
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Rounding Method"
      ),
    }),

  roundingPrecision: Joi.number()
    .integer()
    .required()
    .max(5)
    .positive()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Rounding Precision"
      ),
      "number.integer": generateValidationErrorMessage(
        "NUMBER",
        "Rounding Precision"
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Rounding Precision"
      ),
      "number.max": generateValidationErrorMessage(
        "MAX_NUMBER",
        "Rounding Precision: 3"
      ),
    }),
  timeZone: Joi.string()
    .trim()
    .allow(null, "")
    .optional()
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Time Zone"),
    }),
  excelBatchSize: Joi.number()
    .integer()
    .optional()
    .default(100)
    .positive()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Excel Batch Size"
      ),
      "number.integer": generateValidationErrorMessage(
        "NUMBER",
        "Excel Batch Size"
      ),
      "number.positive": generateValidationErrorMessage(
        "NON_NEGATIVE",
        "Excel Batch Size"
      ),
    }),
});

export const validateSettings = validationHandler({ schema: settingsSchema });
