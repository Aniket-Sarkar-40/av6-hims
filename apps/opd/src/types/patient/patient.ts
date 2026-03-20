import { FormData } from "@repo/shared/utils/types.utils.js";
import { Country, Patient, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";

export type PatientReq = Omit<
  Prisma.PatientUncheckedCreateInput,
  | "patientUniqueId"
  | "isActive"
  | "createdAt"
  | "updatedAt"
  | "disableAt"
  | "uniqueSequenceNumber"
>;
export type PatientCreateFormData = FormData<PatientReq>;

export type PatientUpdateFormData = FormData<PatientReq, "id">;

export interface PatientImage {
  image?: Express.Multer.File[];
  patientImage?: Express.Multer.File[];
  patientSignature?: Express.Multer.File[];
}

export interface PatientDto extends Omit<
  Patient,
  "dob" | "country" | "isActive" | "clientId"
> {
  country: IdValue | null;
  client: IdValue | null;
  patientUniqueId: number;
}

export type PatientInternalRes = Pick<
  Patient,
  | "id"
  | "patientName"
  | "patientUniqueId"
  | "email"
  | "dob"
  | "employeeId"
  | "gender"
  | "image"
  | "mobileNo"
  | "address"
  | "age"
  | "age"
>;
