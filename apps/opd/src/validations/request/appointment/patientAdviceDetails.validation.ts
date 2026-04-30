import { CreatePatientAdviceDetailsInput } from "@/types/appointment/patientAdviceDetails.js";
import {
  boolOptional,
  idRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const createPatientAdviceDetailsSchema =
  Joi.object<CreatePatientAdviceDetailsInput>({
    appointmentId: idRequired("Appointment Id"),

    advice: strOptional("Advice"),

    initialComplaint: strRequired("Initial Complaint"),

    referToEmergency: boolOptional("Refer to Emergency").default(false),
    referToAdmission: boolOptional("Refer to Admission").default(false),
    visitComplete: boolOptional("Visit Complete").default(false),

    referToMentalHealth: boolOptional("Refer to Mental Health").default(false),
    referToAntenatalCare: boolOptional("Refer to Antenatal Care").default(
      false
    ),
    surgeryRequest: boolOptional("Surgery Request").default(false),
    referToOutsideHospital: boolOptional("Refer to Outside Hospital").default(
      false
    ),
  });

export const validatePatientAdviceDetailsCreate = validationHandler({
  schema: createPatientAdviceDetailsSchema,
});
