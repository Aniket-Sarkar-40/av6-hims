import { Consultation, Prisma } from "@repo/db/generated/prisma/client";
import { AppointmentDetailsDto } from "./appointment.js";

export type CreateConsultationInput = Omit<
  Prisma.ConsultationUncheckedCreateInput,
  | "id"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export interface UpdateConsultationInput extends CreateConsultationInput {
  id: number;
}

export interface NotesDetails {
  id: number;
  notesName: string;
  note: string;
}
export interface ConsultationDTO extends Omit<
  Consultation,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "deletedAt"
  | "createdAt"
  | "updatedAt"
  | "appointmentId"
  | "patientId"
  | "consultationNotes"
> {
  appointment: AppointmentDetailsDto | null;
  consultationNotes: NotesDetails[];
}

export type ConsultationResponse = Prisma.ConsultationGetPayload<{
  include: {
    appointment: true;
  };
}>;
