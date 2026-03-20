import { FormData } from "@repo/shared/utils/types.utils.js";
import { PatientDocument, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";
import { AppointmentDetailsDto } from "./appointment.js";

export type DocumentMasterReq = Omit<
  Prisma.PatientDocumentUncheckedCreateInput,
  | "id"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;
export type DocumentMasterReqWoPatient = Omit<
  Prisma.PatientDocumentUncheckedCreateInput,
  "id" | "patientId"
>;

export type DocumentMasterEntity = FormData<DocumentMasterReq>;

export type DocumentMasterEntityWoPatient = FormData<
  Omit<DocumentMasterReq, "patientId">
>;

export interface DocumentMasterDTO extends Omit<
  PatientDocument,
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
  patient: IdValue | null;
  appointment: AppointmentDetailsDto | null;
}

export type DocumentResponse = Prisma.PatientDocumentGetPayload<{
  include: {
    appointment: true;
    patient: true;
  };
}>;
