import Joi from "joi";
import { PmsWarehouse } from "@repo/db/generated/prisma/client";
import {
  boolOptional,
  emailRequired,
  idOptional,
  idRequired,
  intOptional,
  phoneRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const warehouseSchema = Joi.object<PmsWarehouse>({
  id: idRequired("Collection center id"),
  name: strRequired("Name", 2),
  vatNo: strRequired("Vat No", 2),
  tinNo: strRequired("Tin No"),
  businessSubline: strOptional("Business sub line"),
  contactPerson: strRequired("Contact person"),
  countryCode: strOptional("Country code"),
  phone: phoneRequired("Phone"),
  email: emailRequired("Email"),
  countryId: idOptional("Country Id"),

  stateId: idOptional("State Id"),

  cityId: idOptional("City Id"),
  address: strRequired("Address"),
  area: strOptional("Area"),
  pinCode: intOptional("Pin code"),
  latitudeLongitude: strOptional("Latitude and longitude"),
  isMain: boolOptional("Is Main").default(false),
});

export const validateWarehouse = validationHandler({
  schema: warehouseSchema,
});
