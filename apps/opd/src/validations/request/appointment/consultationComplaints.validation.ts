import { CreateConsultationComplaintsInput } from "@/types/appointment/consultationComplaint.js";
import { idRequired, strRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const createConsultationComplaintsSchema =
  Joi.object<CreateConsultationComplaintsInput>({
    complaint: Joi.array()
      .items(strRequired("Complaint"))
      .min(1)
      .unique((a, b) => a.trim().toLowerCase() === b.trim().toLowerCase())
      .required()
      .messages({
        "array.base": generateValidationErrorMessage("ARRAY", "Complaints"),
        "array.min": generateValidationErrorMessage(
          "ARRAY_MIN_LENGTH",
          "Complaints",
          "1"
        ),
        "array.unique": generateValidationErrorMessage("UNIQUE", "Complaints"),
        "any.required": generateValidationErrorMessage(
          "REQUIRED",
          "Complaints"
        ),
      }),

    appointmentId: idRequired("Appointment Id"),
  });

export const validateConsultationComplaintsCreate = validationHandler({
  schema: createConsultationComplaintsSchema,
});
