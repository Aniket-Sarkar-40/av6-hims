import { CreateOrUpdateConsultationNotesMapping } from "@/types/master/consultationNotesMapping.js";
import {
  idRequired,
  numberArrayRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const consultationNotesMappingCreateSchema =
  Joi.object<CreateOrUpdateConsultationNotesMapping>({
    doctorId: idRequired("Doctor ID"),
    consultationNotesId: numberArrayRequired("Consultation Notes ID"),
  });

export const consultationNotesMappingUpdateSchema =
  consultationNotesMappingCreateSchema.keys({
    id: idRequired("ID"),
  });

export const validateConsultationNotesMappingCreate = validationHandler({
  schema: consultationNotesMappingCreateSchema,
});

export const validateConsultationNotesMappingUpdate = validationHandler({
  schema: consultationNotesMappingUpdateSchema,
});
