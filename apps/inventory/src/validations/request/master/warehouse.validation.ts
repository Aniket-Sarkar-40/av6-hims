import { InvWarehouse } from "@repo/db/generated/prisma/client";
import {
  emailRequired,
  idOptional,
  idRequired,
  phoneRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const warehouseSchema = Joi.object<InvWarehouse>({
  id: idRequired("Collection Center Id"),
  name: strRequired("Name"),
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
});

export const validateWarehouse = validationHandler({
  schema: warehouseSchema,
});
