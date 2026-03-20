import { PatientConsultation, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";
import { AppointmentDetailsDto } from "./appointment.js";

export type CreatePatientConsultationInput = Omit<
  Prisma.PatientConsultationUncheckedCreateInput,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export interface UpdatePatientConsultationInput extends CreatePatientConsultationInput {
  id: number;
}

export interface PatientConsultationDTO extends Omit<
  PatientConsultation,
  | "isActive"
  | "deletedAt"
  | "deletedBy"
  | "createdBy"
  | "updatedBy"
  | "patientId"
  | "appointmentId"
> {
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
  appointment: AppointmentDetailsDto | null;
}

export type PatientConsultationRes = Prisma.PatientConsultationGetPayload<{
  include: {
    appointment: true;
  };
}>;
