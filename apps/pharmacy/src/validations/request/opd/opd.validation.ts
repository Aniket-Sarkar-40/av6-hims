import { idOptional, idRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

const opdBillReqSchema = Joi.object({
  aptId: idRequired("Appointment ID"),

  branchId: idOptional("Branch ID"),
});

export const validateOPD = validationHandler({
  schema: opdBillReqSchema,
});
