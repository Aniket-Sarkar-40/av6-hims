import Joi from "joi";
import { joiDecimalFromSettings } from "@/utils/helper.utils.js";
import { FetchRateOfExchangeType } from "@/types/master/rateOfExchange.js";
import {
  dateRequired,
  enumRequired,
  idRequired,
} from "@repo/shared/utils/joi.utils.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const createRateOfExchangeSchema = Joi.object({
  companyId: idRequired("Company Id"),
  currencyId: idRequired("Currency Id"),
  date: dateRequired("Date"),
  stdRate: joiDecimalFromSettings({ key: "roundingPrecision", required: true })
    .greater(0)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Standard Rate"),
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Standard Rate",
        "{{#limit}}"
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Standard Rate"
      ),
      "number.greater": generateValidationErrorMessage(
        "MUST_GREATER_THAN",
        "Standard Rate",
        "0"
      ),
    }),
  sellingRate: joiDecimalFromSettings({
    key: "roundingPrecision",
    required: false,
  })
    .greater(0)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Selling Rate"),
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Selling Rate",
        "{{#limit}}"
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Selling Rate"
      ),
      "number.greater": generateValidationErrorMessage(
        "MUST_GREATER_THAN",
        "Selling Rate",
        "0"
      ),
    }),
  buyingRate: joiDecimalFromSettings({
    key: "roundingPrecision",
    required: false,
  })
    .greater(0)
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Buying Rate"),
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Buying Rate",
        "{{#limit}}"
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Buying Rate"),
      "number.greater": generateValidationErrorMessage(
        "MUST_GREATER_THAN",
        "Buying Rate",
        "0"
      ),
    }),
});
export const fetchRateOfExchangeSchema = Joi.object({
  companyId: idRequired("Company Id"),
  currencyId: idRequired("Currency Id"),
  date: dateRequired("Date"),
  type: enumRequired("Type", FetchRateOfExchangeType),
});

export const validateCreateRateOfExchange = validationHandler({
  schema: createRateOfExchangeSchema,
});
export const validateFetchRateOfExchange = validationHandler({
  schema: fetchRateOfExchangeSchema,
});
