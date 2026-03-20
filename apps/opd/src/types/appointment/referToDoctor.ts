import { PatientReferToDoctor, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";
import { AppointmentDetailsDto } from "./appointment.js";

export type CreateReferToDoctorInput = Omit<
  Prisma.PatientReferToDoctorUncheckedCreateInput,
  | "id"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export interface UpdateReferToDoctorInput {
  id: number;
}

export interface ReferToDoctorDTO extends Omit<
  PatientReferToDoctor,
  | "appointmentId"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "deletedAt"
  | "opdDepartmentId"
  | "doctorId"
> {
  appointment: AppointmentDetailsDto | null;
  opdDepartment: IdValue | null;
  doctor: IdValue | null;
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
}

export type ReferToDoctorResponse = Prisma.PatientReferToDoctorGetPayload<{
  include: {
    appointment: true;
    doctor: true;
  };
}>;
