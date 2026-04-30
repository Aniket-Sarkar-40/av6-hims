import Joi from "joi";
import { MedCategoryInput } from "@/types/master/medCategory.js";
import { joiDecimalFromSettings } from "@/utils/commonCalculation.utils.js";
import {
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const MedCategoryInputSchema = Joi.object<MedCategoryInput>({
  name: strRequired("Name", 2),

  description: strOptional("Description"),
  minMarginB2CPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Min Margin B2C Percentage must be a number",
    "number.precision":
      "Min Margin B2C Percentage must have {{#limit}} decimal places",
    "number.optional": "Min Margin B2C Percentage is optional",
  }),
  minMarginB2BPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Min Margin B2B Percentage must be a number",
    "number.precision":
      "Min Margin B2B Percentage must have {{#limit}} decimal places",
    "number.optional": "Min Margin B2B Percentage is optional",
  }),
  loyaltyPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Loyalty Percentage must be a number",
    "number.precision":
      "Loyalty Percentage must have {{#limit}} decimal places",
    "number.optional": "Loyalty Percentage is optional",
  }),
});

export const validateMedCategoryInput = validationHandler({
  schema: MedCategoryInputSchema,
});

export const MedCategoryInputSchemaUpdate = Joi.object<MedCategoryInput>({
  id: idRequired("Med Category Id"),

  name: strRequired("Name", 2),

  description: strOptional("Description"),

  minMarginB2CPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Min Margin B2C Percentage must be a number",
    "number.precision":
      "Min Margin B2C Percentage must have {{#limit}} decimal places",
    "number.optional": "Min Margin B2C Percentage is optional",
  }),
  minMarginB2BPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Min Margin B2B Percentage must be a number",
    "number.precision":
      "Min Margin B2B Percentage must have {{#limit}} decimal places",
    "number.optional": "Min Margin B2B Percentage is optional",
  }),
  loyaltyPercentage: joiDecimalFromSettings({
    key: "itemPrecision",
    max: 100,
    min: 0,
  }).messages({
    "number.base": "Loyalty Percentage must be a number",
    "number.precision":
      "Loyalty Percentage must have {{#limit}} decimal places",
    "number.optional": "Loyalty Percentage is optional",
  }),
});

export const validateMedCategoryInputUpdate = validationHandler({
  schema: MedCategoryInputSchemaUpdate,
});
