import { CreateConsultationInput } from "@/types/appointment/consultation.js";
import { idRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const CreateConsultationSchema = Joi.object<CreateConsultationInput>({
  appointmentId: idRequired("Appointment Id"),

  //need to fix error message for consultationNotes
  consultationNotes: Joi.object()
    .required()
    .custom((value, helpers) => {
      // Must be an object
      if (typeof value !== "object" || value === null) {
        return helpers.error("object.base");
      }

      for (const [key, val] of Object.entries(value)) {
        // Key must be numeric
        if (!/^\d+$/.test(key)) {
          return helpers.error("number.base", {
            message: `Key '${key}' must be numeric`,
          });
        }

        // Value must be non-empty string
        if (typeof val !== "string" || val.trim() === "") {
          return helpers.error("string.base", {
            message: `Value for key '${key}' cannot be empty`,
          });
        }
      }

      return value; // valid
    }, "Validate consultationNotes")
    .messages({
      "any.required": generateValidationErrorMessage(
        "REQUIRED",
        "Consultation Notes",
      ),
      "object.base": generateValidationErrorMessage(
        "JSON_OBJECT",
        "Consultation Notes",
      ),
      "any.invalid": generateValidationErrorMessage(
        "INVALID",
        "Consultation Notes keys/values",
      ),
      "string.base": generateValidationErrorMessage(
        "STRING",
        "Consultation Notes values",
      ),
      "number.base": generateValidationErrorMessage(
        "NUMBER",
        "Consultation Notes keys",
      ),
    }),
});

export const validateCreateConsultation = validationHandler({
  schema: CreateConsultationSchema,
});
