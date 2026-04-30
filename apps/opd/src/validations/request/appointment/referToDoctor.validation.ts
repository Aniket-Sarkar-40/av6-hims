import {
  CreateReferToDoctorInput,
  UpdateReferToDoctorInput,
} from "@/types/appointment/referToDoctor.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { VisitType } from "@repo/db/generated/prisma/client";
import Joi from "joi";
import {
  enumRequired,
  idRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";

export const CreateReferToDoctorSchema = Joi.object<
  CreateReferToDoctorInput | UpdateReferToDoctorInput
>({
  appointmentId: idRequired("Appointment Id"),

  visitType: enumRequired("Visit Type", VisitType),

  description: strOptional("Description", 500)
    .min(3)
    .messages({
      "string.min": generateValidationErrorMessage(
        "STRING_MIN",
        "Description",
        "3"
      ),
    }),

  opdDepartmentId: idRequired("OPD Department Id"),

  doctorId: idRequired("Doctor Id"),
});

export const UpdateReferToDoctorSchema = CreateReferToDoctorSchema.keys({
  id: idRequired("Refer To Doctor Id"),
});

export const validateCreateReferToDoctor = validationHandler({
  schema: CreateReferToDoctorSchema,
});
export const validateUpdateReferToDoctor = validationHandler({
  schema: UpdateReferToDoctorSchema,
});
