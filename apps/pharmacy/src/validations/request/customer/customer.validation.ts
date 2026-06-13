import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/types/customer/customer.js";
import { PmsGender } from "@repo/db/generated/prisma/enums.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import {
  dateRequired,
  emailRequired,
  enumOptional,
  idRequired,
  intOptional,
  numberWithMaxDecimals,
  patternRequired,
  phoneRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { getPattern } from "av6-core-v2";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const commonCustomerSchema = Joi.object<
  CreateCustomerInput | UpdateCustomerInput
>({
  name: patternRequired("Name", getPattern.nameWithNumPattern).min(2).max(50),
  email: emailRequired("Email"),
  countryCode: strOptional("Country Code"),
  mobileNo: phoneRequired("Mobile Number"),
  dob: dateRequired("Date of Birth").iso(),
  gender: enumOptional("Gender", PmsGender),
  address1: strRequired("Address 1"),
  address2: strOptional("Address 2"),
  city: strOptional("City"),
  pinCode: intOptional("Pincode"),
  lattitudeLongitude: strOptional("Lattitude Longitude"),
  ghanaCardNo: strRequired("Ghana Card Number"),
  tinNo: strOptional("TIN Number"),
  discount: numberWithMaxDecimals("Discount"),
});
export const updateCustomerSchema = commonCustomerSchema.keys({
  id: idRequired("ID"),
});

export const validateCustomer = validationHandler({
  schema: commonCustomerSchema,
});

export const validateUpdateSchema = validationHandler({
  schema: updateCustomerSchema,
});
