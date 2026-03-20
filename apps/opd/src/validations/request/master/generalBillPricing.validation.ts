import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const BaseGeneralBillPricingSchemaFields = Joi.object({
  generalBillItemId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "General Bill Pricing",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "General Bill Pricing",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "General Bill Pricing",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "General Bill Pricing",
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

  price: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Price"),
      "number.precision": generateValidationErrorMessage(
        "PRECISION",
        "Price",
        "0",
      ),
      "any.required": generateValidationErrorMessage("REQUIRED", "Price"),
      "number.min": generateValidationErrorMessage("MIN_VALUE", "Price", "0"),
    }),
});

export const CreateGeneralBillPricingSchema =
  BaseGeneralBillPricingSchemaFields.keys({
    ccIds: Joi.array()
      .items(
        Joi.number()
          .integer()
          .positive()
          .strict()
          .messages({
            "number.base": generateValidationErrorMessage(
              "NUMBER",
              "Collection Center ID",
            ),
            "number.integer": generateValidationErrorMessage(
              "INTEGER",
              "Collection Center ID",
            ),
            "number.positive": generateValidationErrorMessage(
              "POSITIVE",
              "Collection Center ID",
            ),
          }),
      )
      .min(1)
      .required()
      .messages({
        "array.base": generateValidationErrorMessage(
          "ARRAY",
          "Collection Center IDs",
        ),
        "array.min": generateValidationErrorMessage(
          "MIN",
          "Collection Center IDs",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Collection Center IDs",
        ),
      }),
  });

export const UpdateGeneralBillPricingSchema =
  BaseGeneralBillPricingSchemaFields.keys({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "General Bill Pricing ID",
        ),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "General Bill Pricing ID",
        ),
        "number.positive": generateValidationErrorMessage(
          "POSITIVE",
          "General Bill Pricing ID",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "General Bill Pricing ID",
        ),
      }),

    ccId: Joi.number()
      .integer()
      .positive()
      .required()
      .strict()
      .messages({
        "number.base": generateValidationErrorMessage(
          "NUMBER",
          "Collection Center ID",
        ),
        "number.integer": generateValidationErrorMessage(
          "INTEGER",
          "Collection Center ID",
        ),
        "number.positive": generateValidationErrorMessage(
          "POSITIVE",
          "Collection Center ID",
        ),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Collection Center ID",
        ),
      }),
  });

export const validateCreateGeneralBillPricingSchema = validationHandler({
  schema: CreateGeneralBillPricingSchema,
});
export const validateUpdateGeneralBillPricingSchema = validationHandler({
  schema: UpdateGeneralBillPricingSchema,
});

export const GeneralBillPricingSearchSchema = Joi.object({
  ccId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Collection Center ID",
      ),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Collection Center ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Collection Center ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Collection Center ID",
      ),
    }),

  searchText: Joi.string()
    .trim()
    .min(3)
    .optional()
    .allow("")
    .messages({
      "string.base": generateValidationErrorMessage("STRING", "Search Text"),
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Search Text",
        "3",
      ),
    }),
});

export const validateUpdateGeneralBillPricingSearchSchema = validationHandler({
  schema: GeneralBillPricingSearchSchema,
});
