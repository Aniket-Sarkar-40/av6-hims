import {
  Prisma,
  ConsultationNotesMapping,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";

export interface CreateOrUpdateConsultationNotesMapping extends Omit<
  Prisma.ConsultationNotesMappingUncheckedCreateInput,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "consultationNotesId"
> {
  consultationNotesId: number[];
}

export interface ConsultationNotesMappingDTO extends Omit<
  ConsultationNotesMapping,
  | "doctorId"
  | "createdBy"
  | "updatedBy"
  | "consultationNotes"
  | "consultationNotesId"
  | "isActive"
  | "deletedBy"
  | "deletedAt"
  | "createdAt"
  | "updatedAt"
> {
  doctor: IdValue | null;
  consultationNotes: IdValue | null;
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
}

export type ConsultationNotesMappingRes =
  Prisma.ConsultationNotesMappingGetPayload<{
    include: {
      doctor: true;
    };
  }>;
