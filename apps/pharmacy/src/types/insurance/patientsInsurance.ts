import { PatientInsuranceType } from "@repo/db/generated/prisma/enums.js";
import { InsuranceReq } from "./insurance.js";
import { Patient } from "@repo/db/generated/prisma/client";

export interface PatientInsuranceReq {
  id?: number;
  insurerId: number;
  patientId: number;
  insuranceType: PatientInsuranceType;
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
  insuranceType: PatientInsuranceType;
  insurancePlan?: string | null;
  policyNumber?: string | null;
  relationship?: string | null;
  issueDate?: Date | null;
  expireDate?: Date | null;
  cardFrontImage?: string | null;
  cardBackImage?: string | null;
  createdBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsuranceCardImages {
  cardFrontImage?: Express.Multer.File[];
  cardBackImage?: Express.Multer.File[];
}
