import {
  boolOptional,
  emailRequired,
  idRequired,
  phoneRequired,
  pinCodeOptional,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { InvBranch } from "@repo/db/generated/prisma/client";
import Joi from "joi";

export const branchSchema = Joi.object<InvBranch>({
  id: idRequired("Collection Center Id"),
  name: strRequired("Name"),
  vatNo: strRequired("Vat No"),
  tinNo: strRequired("Tin No"),
  businessSubline: strOptional("Business sub"),
  pharmacistName: strRequired("Pharmacist name"),
  address: strRequired("Address"),
  area: strOptional("Area"),
  countryCode: strOptional("Country code"),
  phone: phoneRequired("Phone no"),

  email: emailRequired("Email"),

  pinCode: pinCodeOptional("Pin code"),
  latitudeLongitude: strOptional("Latitude and longitude"),
  isMain: boolOptional("Is Main"),
});

export const validateBranch = validationHandler({
  schema: branchSchema,
});
