import { CurrencyReq } from "@/types/master/currency.js";
import {
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const currencySchema = Joi.object<CurrencyReq>({
  code: strRequired("Code", 5).min(2),

  name: strRequired("Name", 100).min(1),

  symbol: strOptional("Symbol").min(5),
});

export const currencyUpdateSchema = currencySchema.keys({
  id: idRequired("Id"),
});

export const validateCurrency = validationHandler({
  schema: currencySchema,
});

export const validateUpdateCurrency = validationHandler({
  schema: currencyUpdateSchema,
});
