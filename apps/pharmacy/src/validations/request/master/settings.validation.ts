import { CreateOrUpdateSettings } from "@/types/master/settings.js";
import {
  CalculationMethod,
  RoundFormat,
} from "@repo/db/generated/prisma/enums.js";
import Joi from "joi";
import {
  boolRequired,
  enumOptional,
  intOptional,
  intRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const createOrUpdateSettingsSchema = Joi.object<CreateOrUpdateSettings>({
  isEmail: boolRequired("Is Email"),
  isSMS: boolRequired("Is SMS"),
  isWhatsapp: boolRequired("Is Whatsapp"),
  expiryInMonth: intRequired("Expiry in month"),
  countryCode: strOptional("Country code"),
  slowMovingTimeInMonth: intOptional("Slow moving time in month"),

  // new fields:
  poPrecision: intOptional("PO precision", 0),
  poCalculationMethod: enumOptional("PO calculation method", CalculationMethod),
  defaultPrecision: intOptional("Default precision", 0),

  itemPrecision: intOptional("Item precision", 0),
  sellPrecision: intOptional("Sell precision", 0),
  grnPrecision: intOptional("GRN precision", 0),

  grnCalculationMethod: enumOptional(
    "GRN calculation method",
    CalculationMethod,
  ),
  sellCalculationMethod: enumOptional(
    "Sell calculation method",
    CalculationMethod,
  ),
  grnRoundedFormat: enumOptional("GRN rounded format", RoundFormat),
  sellRoundedFormat: enumOptional("Sell rounded format", RoundFormat),
  grnFinalRoundedFormat: enumOptional("GRN final rounded format", RoundFormat),
  sellFinalRoundedFormat: enumOptional(
    "Sell final rounded format",
    RoundFormat,
  ),
  batchSize: intOptional("Batch size"),
  defaultEmailPostfix: strOptional("Default email postfix"),
});

export const validateSettings = validationHandler({
  schema: createOrUpdateSettingsSchema,
});
