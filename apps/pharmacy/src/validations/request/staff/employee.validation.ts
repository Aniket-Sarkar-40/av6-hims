import { CreateOrUpdateEmployee } from "@/types/staff/employee.js";
import Joi from "joi";
import { getPattern } from "av6-core";
import {
  dateRequired,
  emailRequired,
  idOptional,
  phoneOptional,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const employeeSchema = Joi.object<CreateOrUpdateEmployee>({
  name: strRequired("name", 2, 30).pattern(getPattern.nameWithNumPattern),

  surname: strRequired("Surname", 2, 30).pattern(getPattern.nameWithNumPattern),

  employeeId: strRequired("Employee Id", 2, 50),

  dob: dateRequired("dob"),

  title: strOptional("Title", 50),

  phone: phoneOptional("Phone"),

  email: emailRequired("Email"),

  notes: strOptional("Notes", 200),

  departmentId: idOptional("Department Id"),

  designationId: idOptional("Designation Id"),
});

export const validateEmployee = validationHandler({
  schema: employeeSchema,
});
