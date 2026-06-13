import { CreatePatientConsultationInput } from "@/types/appointment/patientConsultation.js";
import {
  enumOptional,
  idRequired,
  intOptional,
  numberWithMaxDecimals,
  strOptional,
  strRequired,
} from "@repo/shared/utils/joi.utils.js";
import { validationHandler } from "@repo/shared/utils/requestValidationHelper.js";
import Joi from "joi";

export const createPatientConsultationSchema =
  Joi.object<CreatePatientConsultationInput>({
    appointmentId: idRequired("Appointment Id"),

    bloodPressure: strRequired("Blood Pressure"),

    notes: strOptional("Notes"),

    temperature: numberWithMaxDecimals("Temperature").required(),

    weight: numberWithMaxDecimals("Weight"),

    spO2: intOptional("SpO2", 0),

    pulse: intOptional("Pulse", 0),

    height: numberWithMaxDecimals("Height").required(),

    bmi: numberWithMaxDecimals("BMI"),

    systolicBp: intOptional("Systolic BP", 0),

    diastolicBp: intOptional("Diastolic BP", 0),

    respiratoryRate: intOptional("Respiratory Rate", 0),

    heartRateBpm: intOptional("Heart Rate BPM", 0),

    urineOutput: numberWithMaxDecimals("Urine Output").optional(),

    bloodSugarF: numberWithMaxDecimals("Blood Sugar F").optional(),

    bloodSugarR: numberWithMaxDecimals("Blood Sugar R").optional(),

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
