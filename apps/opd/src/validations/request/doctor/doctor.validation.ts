import {
  CreateDoctorInput,
  CreateDoctorScheduleInput,
  UpdateDoctorInput,
  UpdateDoctorScheduleInput,
} from "@/types/doctor/doctor.js";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { getPattern } from "av6-core";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { NextFunction, Request, Response } from "express";
import Joi, { ValidationErrorItem } from "joi";
import {
  arrayRequired,
  emailRequired,
  enumRequired,
  forbiddenField,
  idOptional,
  idRequired,
  intRequired,
  numberArrayRequired,
  patternRequired,
  phoneRequired,
  priceOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const CreateDoctorScheduleSchema = Joi.object<
  CreateDoctorScheduleInput | UpdateDoctorScheduleInput
>({
  ccId: idRequired("Collection Center ID"),
  weekId: intRequired("Week ID", 1, 7),
  startTime: patternRequired("Start Time", /^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: patternRequired("End Time", /^([01]\d|2[0-3]):([0-5]\d)$/)
    .custom((value, helpers) => {
      const { startTime } = helpers.state.ancestors[0];
      if (startTime && value <= startTime) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "End Time Validation")
    .messages({
      "any.invalid": generateValidationErrorMessage(
        "END_BEFORE_START",
        "End Time"
      ),
    }),
  firstVisitPrice: priceOptional("First Visit Price").default(0.0),
  followUpPrice: priceOptional("Follow Up Price").default(0.0),
  vipFirstVisitPrice: priceOptional("Vip First Visit Price").default(0.0),
  vipFollowUpPrice: priceOptional("Vip Follow Up Price").default(0.0),
  specialFirstVisitPrice: priceOptional("Special First Visit Price").default(
    0.0
  ),
  specialFollowUpPrice: priceOptional("Special Follow Up Price").default(0.0),
});

export const CreateDoctorSchema = Joi.object<
  CreateDoctorInput | UpdateDoctorInput
>({
  name: strRequired("Name", 3, 100),
  gender: enumRequired("Gender", {
    Male: "Male",
    Female: "Female",
    Others: "Others",
    Unknown: "Unknown",
  }),
  contactNo: phoneRequired("Contact No"),
  email: emailRequired("Email"),
  doctorRegistrationNo: strRequired("Doctor Registration No", 5, 50),
  address: strRequired("Address", 1, 255),
  collectionCenterIds: numberArrayRequired("Collection Center IDs", 1),
  checkUpTime: intRequired("Check Up Time", 0, 60),
  opdPrimaryDepartmentId: idOptional("OPD Primary Department ID"),
  opdDepartmentId: idOptional("OPD Department ID"),
  opdDepartmentPrefixId: idOptional("OPD Department Prefix ID"),
  licenseType: strRequired("License Type"),
  doctorScheduleDetails: arrayRequired(
    "Doctor Schedule Details",
    CreateDoctorScheduleSchema,
    1
  ),
});

export const UpdateDoctorScheduleSchema = CreateDoctorScheduleSchema.keys({
  id: idOptional("Doctor Schedule ID"),
});

export const UpdateDoctorSchema = CreateDoctorSchema.keys({
  id: idRequired("Doctor ID"),

  // Omit checkUpTime from the update input (reject if provided)
  checkUpTime: forbiddenField("Check Up Time"),

  doctorScheduleDetails: arrayRequired(
    "Doctor Schedule Details",
    UpdateDoctorScheduleSchema,
    1
  ),
});

export const validateDoctorCreate = validationHandler({
  schema: CreateDoctorSchema,
});

export const validateDoctorUpdate = validationHandler({
  schema: UpdateDoctorSchema,
});
