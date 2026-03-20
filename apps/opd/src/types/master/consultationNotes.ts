import { ConsultationNotes, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";

export type CreateOrUpdateConsultationNotes = Omit<
  Prisma.ConsultationNotesUncheckedCreateInput,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "consultationNotesMapping"
>;

export interface ConsultationNotesDTO extends Omit<
  ConsultationNotes,
  "isActive" | "deletedAt" | "deletedBy" | "createdBy" | "updatedBy"
> {
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
}
