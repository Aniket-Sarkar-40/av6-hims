import { CreateFollowUpInput } from "@/types/appointment/followUp.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const CreateFollowUpSchema = Joi.object<CreateFollowUpInput>({
  appointmentId: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Appointment ID"),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Appointment ID",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Appointment ID",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Appointment ID",
      ),
    }),

  followUpDays: Joi.number()
    .integer()
    .positive()
    .required()
    .strict()
    .messages({
      "number.base": generateValidationErrorMessage("NUMBER", "Follow Up Days"),
      "number.integer": generateValidationErrorMessage(
        "INTEGER",
        "Follow Up Days",
      ),
      "number.positive": generateValidationErrorMessage(
        "POSITIVE",
        "Follow Up Days",
      ),
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Follow Up Days",
      ),
    }),
});

export const validateCreateFollowUp = validationHandler({
  schema: CreateFollowUpSchema,
});
