import { ClinicalHistory, Prisma } from "@repo/db/generated/prisma/client";
import { AppointmentDetailsDto } from "./appointment.js";
import { IdValue } from "@repo/shared/types/global.js";

export type CreateClinicalHistoryInput = Omit<
  Prisma.ClinicalHistoryUncheckedCreateInput,
  | "id"
  | "isActive"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "deletedBy"
  | "createdBy"
  | "updatedBy"
>;

export interface UpdateClinicalHistoryInput extends CreateClinicalHistoryInput {
  id: number;
}

export interface ClinicalHistoryDTO extends Omit<
  ClinicalHistory,
  | "appointmentId"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "deletedAt"
> {
  appointment: AppointmentDetailsDto | null;
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
}

export type ClinicalHistoryResponse = Prisma.ClinicalHistoryGetPayload<{
  include: {
    appointment: true;
  };
}>;
