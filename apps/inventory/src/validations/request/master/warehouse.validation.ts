import {
  boolOptional,
  emailRequired,
  idRequired,
  idOptional,
  phoneRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { InvWarehouse } from "@repo/db/generated/prisma/client";
import Joi from "joi";

export const warehouseSchema = Joi.object<InvWarehouse>({
  id: idRequired("Collection Center Id"),
  name: strRequired("Name", 2),
  vatNo: strRequired("Vat"),
  tinNo: strRequired("Tin No"),
  businessSubline: strOptional("Business sub line"),
  contactPerson: strRequired("Contact person"),
  countryCode: strOptional("Country code"),
  phone: phoneRequired("Phone number"),
  email: emailRequired("Phone number"),

  address: strRequired("Address"),
  area: strOptional("Area"),
  pinCode: idOptional("Pin code"),
  latitudeLongitude: strOptional("Latitude and longitude"),
  isMain: boolOptional("Is Main"),
});

export const validateWarehouse = validationHandler({
  schema: warehouseSchema,
});
