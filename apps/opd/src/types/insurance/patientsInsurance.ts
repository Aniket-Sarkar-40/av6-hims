import {
  InsuranceType,
  Patient,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { InsuranceReq } from "./insurance.js";
import { IdValue } from "@repo/shared/types/global.js";

export interface PatientInsuranceReq {
  id?: number;
  insurerId: number;
  patientId: number;
  patientUniqueId: number;
  insuranceType: InsuranceType;
  insurancePlan?: string | null;
  policyNumber?: string | null;
  relationship?: string | null;
  issueDate?: Date | null;
  expireDate?: Date | null;
  cardFrontImage?: string | null;
  cardBackImage?: string | null;
}

export interface PatientInsuranceDto {
  id: number;
  insurer: InsuranceReq | null;
  patient: Patient | null;
  insuranceType: InsuranceType;
  insurancePlan?: string | null;
  policyNumber?: string | null;
  relationship?: string | null;
  issueDate?: Date | null;
  expireDate?: Date | null;
  cardFrontImage?: string | null;
  cardBackImage?: string | null;
  createdBy: IdValue | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsuranceCardImages {
  cardFrontImage?: Express.Multer.File[];
  cardBackImage?: Express.Multer.File[];
}

export type PatientInsuranceRes = Prisma.PatientInsuranceGetPayload<{
  include: {
    insurance: true;
  };
}>;
