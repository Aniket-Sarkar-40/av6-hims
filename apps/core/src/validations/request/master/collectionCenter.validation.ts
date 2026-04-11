import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { getPattern } from "av6-utils";
import { CollectionCenter } from "@repo/db/generated/prisma/client";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import {
  boolOptional,
  dateOptional,
  emailRequired,
  idOptional,
  idRequired,
  intRequired,
  phoneRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const collectionCenterSchema = Joi.object<CollectionCenter>({
  id: idOptional("ID"),

  colName: strRequired("Name", 2),
  email: emailRequired("Email"),

  phone: phoneRequired("Phone"),

  address: strRequired("Address"),

  dateFormat: strRequired("Date format"),
  langId: intRequired("Language Id"),

  timeFormat: strRequired("Time format"),

  currency: strRequired("Currency", 1, 3).uppercase(),

  currencySymbol: strRequired("Currency symbol"),

  timezone: strRequired("Timezone"),

  testPrefix: strRequired("Test Prefix"),

  barcodePrefix: strRequired("Barcode Prefix"),

  invoicePrefix: strRequired("Invoice Prefix"),

  diseCode: strRequired("Dise Code"),

  disabledBy: strOptional("Disabled By"),

  collectionAbbreviationName: strOptional("Collection abbreviation name"),

  connectionCode: strRequired("Connection code"),

  barcodePrinterName: strOptional("Barcode printer name"),

  disabledOn: dateOptional("Disabled On").iso().allow(null),

  isSubOrganization: boolOptional("Is Sub Organization"),
});

export const validateCollectionCenter = validationHandler({
  schema: collectionCenterSchema,
});

export const collectionCenterSchemaUpdate = collectionCenterSchema.keys({
  id: idRequired("ID"),
});

export const validateCollectionCenterUpdate = validationHandler({
  schema: collectionCenterSchemaUpdate,
});
