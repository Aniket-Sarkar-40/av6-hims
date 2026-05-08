import { CurrencyReq } from "@/types/master/currency.js";
import {
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const currencySchema = Joi.object<CurrencyReq>({
  code: strRequired("Code", 2, 5),

  name: strRequired("Name", 1, 100),

  symbol: strOptional("Symbol", 5),
});

export const currencyUpdateSchema = currencySchema.keys({
  id: idRequired("ID"),
});

export const validateCurrency = validationHandler({
  schema: currencySchema,
});

export const validateUpdateCurrency = validationHandler({
  schema: currencyUpdateSchema,
});
