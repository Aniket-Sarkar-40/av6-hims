import Joi from "joi";
import { getPattern } from "av6-core-v2";
import { CreateStaffDesignationInput } from "@/types/staff/designation.js";
import { strRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";

export const staffDesignationSchema = Joi.object<CreateStaffDesignationInput>({
  designation: strRequired("Designation", 2, 50).pattern(
    getPattern.nameWithNumPattern,
  ),
});

export const validateStaffDesignation = validationHandler({
  schema: staffDesignationSchema,
});
