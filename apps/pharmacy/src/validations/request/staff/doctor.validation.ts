import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { getPattern } from "av6-core";
import { BaseResponse } from "@repo/shared/utils/baseResponse.utils.js";
import { CreateOrUpdateDoctor } from "@/types/staff/doctor.js";
import {
  dateRequired,
  emailRequired,
  idOptional,
  phoneOptional,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const doctorSchema = Joi.object<CreateOrUpdateDoctor>({
  id: idOptional("Id"),
  name: strRequired("Name", 2, 50),

  surname: strRequired("Surname", 2, 50),

  employeeId: strRequired("Employee Id", 2, 50),

  dob: dateRequired("DOB"),

  title: strOptional("Title", 50).min(2),

  phone: phoneOptional("Phone"),

  email: emailRequired("Email"),

  notes: strOptional("Notes", 200),

  departmentId: idOptional("Department Id"),

  designationId: idOptional("Designation Id"),
});

export const validateDoctor = validationHandler({
  schema: doctorSchema,
});
