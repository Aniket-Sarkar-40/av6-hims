import { CreateOrUpdateSettings } from "@/types/master/settings.js";
import {
  CalculationMethod,
  ItemStockType,
  RoundFormat,
} from "@repo/db/generated/prisma/enums.js";
import {
  boolRequired,
  enumOptional,
  intOptional,
  intRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const createOrUpdateSettingsSchema = Joi.object<CreateOrUpdateSettings>({
  isEmail: boolRequired("Is Email"),
  isSMS: boolRequired("Is SMS"),
  isAccounting: boolRequired("Is Accounting"),
  warehouseMode: boolRequired("Warehouse Mode"),
  supplierMode: boolRequired("Supplier Mode"),
  isWhatsapp: boolRequired("Is Whatsapp"),
  expiryInMonth: intRequired("Expiry in month"),
  countryCode: strOptional("Country code"),
  batchSize: intOptional("Batch size"),

  defaultPrecision: intOptional("Default precision", 0),
  grnCalculationMethod: enumOptional("GRN calculation", CalculationMethod),

  grnRoundedFormat: enumOptional("GRN rounded format", RoundFormat),

  grnFinalRoundedFormat: enumOptional("GRN final rounded format", RoundFormat),

  grnPrecision: intOptional("GRN precision", 0),
  poPrecision: intOptional("PO precision", 0),
  itemPrecision: intOptional("Item precision", 0),
  poCalculationMethod: enumOptional("PO calculation method", CalculationMethod),
  itemStockType: enumOptional("Item stock type", ItemStockType),
  poRoundedFormat: enumOptional("PO rounded format", RoundFormat),
});

export const validateSettings = validationHandler({
  schema: createOrUpdateSettingsSchema,
});
