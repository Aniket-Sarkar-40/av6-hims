import { CreatePatientConsultationInput } from "@/types/appointment/patientConsultation.js";
import {
  enumOptional,
  idRequired,
  intOptional,
  intRequired,
  numberWithMaxDecimals,
  numberWithMaxDecimalsRequired,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import { generateValidationErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import Joi from "joi";

export const createPatientConsultationSchema =
  Joi.object<CreatePatientConsultationInput>({
    appointmentId: idRequired("Appointment Id"),

    bloodPressure: strRequired("Blood Pressure"),

    notes: strOptional("Notes"),

    temperature: numberWithMaxDecimals("Temperature", 2).required(),

    weight: numberWithMaxDecimals("Weight", 2),

    spO2: intOptional("SpO2", 0),

    pulse: intOptional("Pulse", 0),

    height: numberWithMaxDecimals("Height", 2).required(),

    bmi: numberWithMaxDecimals("BMI", 2),

    systolicBp: intOptional("Systolic BP", 0),

    diastolicBp: intOptional("Diastolic BP", 0),

    respiratoryRate: intOptional("Respiratory Rate", 0),

    heartRateBpm: intOptional("Heart Rate BPM", 0),

    urineOutput: numberWithMaxDecimals("Urine Output", 2).optional(),

    bloodSugarF: numberWithMaxDecimals("Blood Sugar F", 2).optional(),

    bloodSugarR: numberWithMaxDecimals("Blood Sugar R", 2).optional(),

    oxygenSupplementation: intOptional("Oxygen Supplementation", 0),

    intake: intOptional("Intake", 0),

    output: intOptional("Output", 0),

    bloodGroup: enumOptional("Blood Group", {
      A_POSITIVE: "A_POSITIVE",
      A_NEGATIVE: "A_NEGATIVE",
      B_POSITIVE: "B_POSITIVE",
      B_NEGATIVE: "B_NEGATIVE",
      AB_POSITIVE: "AB_POSITIVE",
      AB_NEGATIVE: "AB_NEGATIVE",
      O_POSITIVE: "O_POSITIVE",
      O_NEGATIVE: "O_NEGATIVE",
    }),

    comments: strOptional("Comments"),

    blood: strOptional("Blood"),
  });

export const patientConsultationUpdateSchema =
  createPatientConsultationSchema.keys({
    id: idRequired("Patient Consultation Id"),
  });

export const validatePatientConsultationCreate = validationHandler({
  schema: createPatientConsultationSchema,
});

export const validatePatientConsultationUpdate = validationHandler({
  schema: patientConsultationUpdateSchema,
});
