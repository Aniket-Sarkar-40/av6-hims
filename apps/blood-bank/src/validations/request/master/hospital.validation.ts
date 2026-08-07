import { Hospital } from "@repo/db/generated/prisma/client";
import {
  emailRequired,
  idOptional,
  idRequired,
  phoneOptional,
  phoneRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const hospitalSchema = Joi.object<Hospital>({
  id: idRequired("Collection Center Id"),
  name: strRequired("Name"),
  code: strOptional("Code"),
  registrationNumber: strOptional("Registration Number"),
  licenseNumber: strOptional("License Number"),
  contactPerson: strOptional("Contact person"),
  countryCode: strOptional("Country code"),
  phone: phoneRequired("Phone number"),
  email: emailRequired("Phone number"),
  address: strRequired("Address"),
  area: strOptional("Area"),
  pinCode: idOptional("Pin code"),
  latitudeLongitude: strOptional("Latitude and longitude"),
  alternatePhone: phoneOptional("ALternate Phone"),
  emergencyPhone: phoneOptional("Emergency Phone"),
});

export const validateHospital = validationHandler({
  schema: hospitalSchema,
});
