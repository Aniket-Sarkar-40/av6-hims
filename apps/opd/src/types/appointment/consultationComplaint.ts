import {
  ConsultationComplaint,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";
import { AppointmentDetailsDto } from "./appointment.js";

export type CreateConsultationComplaintsInput = Omit<
  Prisma.ConsultationComplaintUncheckedCreateInput,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export interface ConsultationComplaintsDTO extends Omit<
  ConsultationComplaint,
  | "isActive"
  | "deletedAt"
  | "deletedBy"
  | "createdBy"
  | "updatedBy"
  | "appointmentId"
  | "patientId"
> {
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
  appointment: AppointmentDetailsDto | null;
}

export type ConsultationComplaintResponse =
  Prisma.ConsultationComplaintGetPayload<{
    include: {
      appointment: true;
    };
  }>;
