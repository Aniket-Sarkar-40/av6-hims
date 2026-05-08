import Joi from "joi";
import { getPattern } from "av6-core-v2";
import {
  enumOptional,
  intOptional,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { YesNoFlag } from "@repo/db/generated/prisma/enums.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const departmentSchema = Joi.object({
  name: strRequired("Name", 2, 50).pattern(getPattern.nameWithNumPattern),

  deptId: strOptional("Dept Id", 50).min(1),

  deptDisplayText: strOptional("Dept Display Text", 100).min(2),

  deptSequence: intOptional("Dept Sequence", 0),

  isSample: enumOptional("Is Sample", { 0: "0", 1: "1" }),

  isAnalyte: enumOptional("Is Analyte", { 0: "0", 1: "1" }),

  masterDept: intOptional("Master Dept", 0),

  tatData: strOptional("TAT Data"),

  printInTrs: enumOptional("Print in Trs", YesNoFlag),

  isActive: enumOptional("Is Active", YesNoFlag),

  designation: strOptional("Designation"),
});
export const validateDepartment = validationHandler({
  schema: departmentSchema,
});
