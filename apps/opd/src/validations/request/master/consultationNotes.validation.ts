import { CreateOrUpdateConsultationNotes } from "@/types/master/consultationNotes.js";
import { idRequired, strRequired } from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const consultationNotesCreateSchema =
  Joi.object<CreateOrUpdateConsultationNotes>({
    consultationName: strRequired("Consultation Name"),
  });

export const consultationNotesUpdateSchema = consultationNotesCreateSchema.keys(
  {
    id: idRequired("ID"),
  }
);

// Validation handler for Consultation Notes creation
export const validateConsultationNotesCreate = validationHandler({
  schema: consultationNotesCreateSchema,
});

export const validateConsultationNotesUpdate = validationHandler({
  schema: consultationNotesUpdateSchema,
});
