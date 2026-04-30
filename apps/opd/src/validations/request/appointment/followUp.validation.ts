import { CreateFollowUpInput } from "@/types/appointment/followUp.js";
import { idRequired, intRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const CreateFollowUpSchema = Joi.object<CreateFollowUpInput>({
  appointmentId: idRequired("Appointment Id"),

  followUpDays: intRequired("Follow Up Days", 0),
});

export const validateCreateFollowUp = validationHandler({
  schema: CreateFollowUpSchema,
});
