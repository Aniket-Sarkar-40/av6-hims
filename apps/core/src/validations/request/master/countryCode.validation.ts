// validation/countryCodeSchemas.ts
import Joi from "joi";
import { idRequired, strRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const createCountryCodeSchema = Joi.object({
  countryCode: strRequired("Country Code"),
  countryId: idRequired("Country Id"),
});

export const updateCountryCodeSchema = createCountryCodeSchema.keys({
  id: idRequired("Id"),
});

export const validateCountryCodeCreate = validationHandler({
  schema: createCountryCodeSchema,
});

export const validateCountryCodeUpdate = validationHandler({
  schema: updateCountryCodeSchema,
});
