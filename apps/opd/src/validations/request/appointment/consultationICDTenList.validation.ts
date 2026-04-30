import { CreateOrUpdateConsultationICDTenList } from "@/types/appointment/consultationICDTenList.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import {
  CategoryType,
  ConsultationICD10Type,
  StatusOfDiagnosis,
} from "@repo/db/generated/prisma/client";
import Joi from "joi";
import {
  enumOptional,
  idRequired,
  strOptional,
} from "@repo/shared/utils/joi.utils.js";

export const consultationICDTenListBaseSchema = {
  appointmentId: idRequired("Appointment Id"),

  icdTenId: idRequired("ICD-10 Id"),

  attendance: strOptional("Attendance", 100),

  type: enumOptional("Type", ConsultationICD10Type),

  statusOfDiagnosis: enumOptional("Status of Diagnosis", StatusOfDiagnosis),

  category: enumOptional("Category", CategoryType),

  adverseEffect: strOptional("Adverse Effect", 150),

  dgrgCode: strOptional("DGRG Code", 100),
};

// Create schema
export const consultationICDTenListCreateSchema =
  Joi.object<CreateOrUpdateConsultationICDTenList>({
    ...consultationICDTenListBaseSchema,
  });

export const consultationICDTenListUpdateSchema =
  Joi.object<CreateOrUpdateConsultationICDTenList>({
    id: idRequired("Consultation ICD-10 List Id"),
    ...consultationICDTenListBaseSchema,
  });

export const validateConsultationICDTenListCreate = validationHandler({
  schema: consultationICDTenListCreateSchema,
});

export const validateConsultationICDTenListUpdate = validationHandler({
  schema: consultationICDTenListUpdateSchema,
});
