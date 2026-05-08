import { CollectionCenter } from "@repo/db/generated/prisma/client";
import Joi from "joi";
import {
  boolOptional,
  dateOptional,
  emailRequired,
  idOptional,
  idRequired,
  phoneRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const collectionCenterSchema = Joi.object<CollectionCenter>({
  id: idOptional("Id"),

  colName: strRequired("Name", 2),
  email: emailRequired("Email"),

  phone: phoneRequired("Phone"),

  address: strRequired("Address"),

  dateFormat: strRequired("Date format"),
  langId: idRequired("Language Id"),

  timeFormat: strRequired("Time format"),

  currency: strRequired("Currency").uppercase().length(3),

  currencySymbol: strRequired("Currency symbol"),

  timezone: strRequired("Timezone"),

  testPrefix: strRequired("Test prefix"),

  barcodePrefix: strRequired("Barcode prefix"),

  invoicePrefix: strRequired("Invoice prefix"),

  diseCode: strRequired("Dise code"),

  disabledBy: strOptional("Disabled by"),

  collectionAbbreviationName: strOptional("Collection abbreviation name"),

  connectionCode: strRequired("Connection code"),

  barcodePrinterName: strOptional("Barcode printer name"),

  disabledOn: dateOptional("Disabled on").iso(),

  isSubOrganization: boolOptional("Is sub organization"),
});

export const validateCollectionCenter = validationHandler({
  schema: collectionCenterSchema,
});

export const collectionCenterSchemaUpdate = Joi.object<CollectionCenter>({
  id: idRequired("Id"),

  colName: strRequired("Name", 2),

  email: emailRequired("Email"),

  phone: phoneRequired("Phone"),

  address: strRequired("Address"),

  dateFormat: strRequired("Date format"),
  langId: idRequired("Language Id"),

  timeFormat: strRequired("Time format"),

  currency: strRequired("Currency").length(3).uppercase(),

  currencySymbol: strRequired("Currency symbol"),

  timezone: strRequired("Timezone"),

  testPrefix: strRequired("Test prefix"),

  barcodePrefix: strRequired("Barcode prefix"),

  invoicePrefix: strRequired("Invoice prefix"),

  diseCode: strRequired("Dise code"),

  disabledBy: strOptional("Disabled by"),

  collectionAbbreviationName: strOptional("Collection abbreviation name"),

  connectionCode: strOptional("Connection code"),

  barcodePrinterName: strOptional("Barcode printer name"),

  disabledOn: dateOptional("Disabled on").iso(),

  isSubOrganization: boolOptional("Is sub organization"),
});

export const validateCollectionCenterUpdate = validationHandler({
  schema: collectionCenterSchemaUpdate,
});
