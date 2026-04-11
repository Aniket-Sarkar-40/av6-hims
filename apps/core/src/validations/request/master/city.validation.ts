import { idRequired, strRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const citySchema = Joi.object({
  name: strRequired("City Name"),

  countryId: idRequired("Country ID"),

  stateId: idRequired("State ID"),
});

export const updateCitySchema = (citySchema as Joi.ObjectSchema).keys({
  id: idRequired("City ID"),
});
export const validateCity = validationHandler({
  schema: citySchema,
});

export const validateCityUpdate = validationHandler({
  schema: updateCitySchema,
});
