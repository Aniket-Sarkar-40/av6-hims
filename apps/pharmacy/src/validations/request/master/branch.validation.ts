import { BranchReq } from "@/types/master/branch.js";
import {
  arrayOptional,
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
import Joi from "joi";

export const branchSchema = Joi.object<BranchReq>({
  id: idRequired("Collection Center Id"),
  name: strRequired("Name", 2),
  vatNo: strRequired("Vat No"),
  tinNo: strRequired("Tin No"),
  businessSubline: strOptional("Business sub line"),
  pharmacistName: strRequired("Pharmacist name"),
  address: strRequired("Address"),
  area: strOptional("Area"),
  countryCode: strOptional("Country code"),
  phone: phoneRequired("Phone"),
  countryId: idOptional("Country Id"),
  stateId: idOptional("State Id"),
  cityId: idOptional("City Id"),
  email: emailRequired("Email"),
  pinCode: intOptional("Pin code"),
  latitudeLongitude: strOptional("Latitude and longitude"),
  isMain: boolOptional("Is Main").default(false),
  categories: arrayOptional("Categories", Joi.number()),
  isAutonomous: boolOptional("Is Autonomous").default(false),
});

export const validateBranch = validationHandler({
  schema: branchSchema,
});
