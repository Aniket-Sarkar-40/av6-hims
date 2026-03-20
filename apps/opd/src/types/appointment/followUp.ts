import { PatientFollowUp, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";
import { AppointmentDetailsDto } from "./appointment.js";

export type CreateFollowUpInput = Omit<
  Prisma.PatientFollowUpUncheckedCreateInput,
  | "id"
  | "isActive"
  | "createdAt"
  | "createdBy"
  | "updatedAt"
  | "updatedBy"
  | "deletedAt"
  | "deletedBy"
  | "followUpDate"
  | "status"
  | "isCurrentDateReminderSent"
  | "isAheadReminderSent"
  | "isReminderSent"
>;

export const ReminderJson = {
  ahead_email_sent: false,
  ahead_sms_sent: false,
  ahead_whatsapp_sent: false,
  current_date_email_sent: false,
  current_date_sms_sent: false,
  current_date_whatsapp_sent: false,
};

export interface FollowUpDTO extends Omit<
  PatientFollowUp,
  | "appointmentId"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "deletedAt"
  | "doctorId"
> {
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
  appointment: AppointmentDetailsDto | null;
  doctor: IdValue | null;
}

export type FollowUpWithDoctor = Prisma.PatientFollowUpGetPayload<{
  include: {
    appointment: true;
    doctor: true;
  };
}>;
