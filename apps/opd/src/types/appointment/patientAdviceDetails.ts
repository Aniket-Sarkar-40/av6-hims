import { PatientAdviceDetails, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";
import { AppointmentDetailsDto } from "./appointment.js";

export type CreatePatientAdviceDetailsInput = Omit<
  Prisma.PatientAdviceDetailsUncheckedCreateInput,
  | "isActive"
  | "id"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export interface UpdateCreatePatientAdviceDetailsInput extends CreatePatientAdviceDetailsInput {
  id: number;
}

export interface PatientAdviceDetailsDTO extends Omit<
  PatientAdviceDetails,
  "isActive" | "deletedAt" | "deletedBy" | "createdBy" | "updatedBy"
> {
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
  appointment: AppointmentDetailsDto | null;
}

export type PatientAdviceDetailsRes = Prisma.PatientAdviceDetailsGetPayload<{
  include: {
    appointment: true;
  };
}>;
