import {
  CalculationMethod,
  RoundFormat,
} from "@repo/db/generated/prisma/client";
import {
  boolRequired,
  enumOptional,
  intOptional,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const createOrUpdateSettingsSchema = Joi.object({
  isEmail: boolRequired("Is Email"),
  isSMS: boolRequired("Is SMS"),
  isWhatsapp: boolRequired("Is Whatsapp"),
  countryCode: strOptional("Country code"),
  defaultPrecision: intOptional("Default precision", 0),
  calculationMethod: enumOptional("Calculation method", CalculationMethod),
  roundedFormat: enumOptional("Round format", RoundFormat),
  finalRoundedFormat: enumOptional("Final round format", RoundFormat),

  batchSize: intOptional("Batch size"),
  defaultEmailPostfix: strOptional("Default email postfix"),
});

export const validateSettings = validationHandler({
  schema: createOrUpdateSettingsSchema,
});
