import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const CreateGeneralBillItemSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.base": generateValidationErrorMessage(
        "STRING",
        "General Bill Item Name",
      ),
      "string.empty": generateValidationErrorMessage(
        "EMPTY",
        "General Bill Item Name",
      ),
      "string.min": generateValidationErrorMessage(
        "MIN",
        "General Bill Item Name",
      ),
      "string.max": generateValidationErrorMessage(
        "MAX",
        "General Bill Item Name",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "General Bill Item Name",
      ),
    }),

  description: Joi.string()
    .trim()
    .allow(null, "")
    .max(500)
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Description"),
      "string.max": generateValidationErrorMessage("MAX", "Description"),
    }),

  defaultPrice: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Default Price"),
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Default Price",
        "0",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Default Price",
      ),
      "number.min": generateValidationErrorMessage(
        "MIN_VALUE",
        "Default Price",
        "0",
      ),
    }),
});

export const UpdateGeneralBillItemSchema = CreateGeneralBillItemSchema.keys({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "General Bill Item ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "General Bill Item ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "General Bill Item ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "General Bill Item ID",
      ),
    }),
});

export const validateCreateGeneralBillItemSchema = validationHandler({
  schema: CreateGeneralBillItemSchema,
});
export const validateUpdateGeneralBillItemSchema = validationHandler({
  schema: UpdateGeneralBillItemSchema,
});
