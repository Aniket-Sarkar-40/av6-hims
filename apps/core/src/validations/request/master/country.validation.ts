import { idRequired, strRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const countrySchema = Joi.object<{
  alpha2Code: string | null;
  alpha3Code: string | null;
  enShortName: string | null;
  nationality: string;
}>({
  alpha2Code: strRequired("Alpha-2 code", 2).allow(null).uppercase(),

  alpha3Code: strRequired("Alpha-3 code", 3).allow(null).uppercase(),

  enShortName: strRequired("English short name", 2, 52).allow(null),

  nationality: strRequired("Nationality", 2, 39).allow(null),
});

export const updateCountrySchema = (countrySchema as Joi.ObjectSchema).keys({
  id: idRequired("Country ID"),
});

export const validateCountry = validationHandler({
  schema: countrySchema,
});

export const validateCountryUpdate = validationHandler({
  schema: updateCountrySchema,
});
