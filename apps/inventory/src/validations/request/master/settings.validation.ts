import { CreateOrUpdateSettings } from "@/types/master/settings.js";
import {
  boolRequired,
  enumOptional,
  idOptional,
  idRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import {
  CalculationMethod,
  RoundFormat,
} from "@repo/db/generated/prisma/client";
import Joi from "joi";

export const createOrUpdateSettingsSchema = Joi.object<CreateOrUpdateSettings>({
  isEmail: boolRequired("Is Email"),
  isSMS: boolRequired("Is SMS"),
  warehouseMode: boolRequired("Warehouse Mode"),
  supplierMode: boolRequired("Supplier Mode"),
  isWhatsapp: boolRequired("Is Whatsapp"),
  expiryInMonth: idRequired("Expiry in month"),
  countryCode: strOptional("Country code"),
  batchSize: idOptional("Batch size"),

  defaultPrecision: idRequired("Default precision"),
  grnCalculationMethod: enumOptional("GRN calculation", CalculationMethod),

  grnRoundedFormat: enumOptional("GRN rounded format", RoundFormat),

  grnFinalRoundedFormat: enumOptional("GRN final rounded format", RoundFormat),
});

export const validateSettings = validationHandler({
  schema: createOrUpdateSettingsSchema,
});
