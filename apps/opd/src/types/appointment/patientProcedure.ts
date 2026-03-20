import { Prisma } from "@repo/db/generated/prisma/client";

export type PatientProcedureDetailsInput = Omit<
  Prisma.PatientProcedureDetailsUncheckedCreateWithoutPatientProcedureInput,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "isReturned"
>;

export type PatientProcedureInput = Omit<
  Prisma.PatientProcedureUncheckedCreateWithoutPatientProcedureDetailsInput,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "patientProcedureRefNo"
  | "paidAmount"
  | "refundAmount"
  | "refundedAmount"
  | "status"
  | "procedureDoneBy"
  | "billNumber"
  | "remark"
  | "insurerInvoiceId"
>;

export interface PatientProcedureCreateInput extends PatientProcedureInput {
  patientProcedureDetails: PatientProcedureDetailsInput[];
}

export interface PatientProcedureUpdateInput extends PatientProcedureCreateInput {
  id: number;
  existing: PatientProcedureResponse;
}

export type PatientProcedureResponse = Prisma.PatientProcedureGetPayload<{
  include: {
    patientProcedureDetails: {
      where: {
        isActive: true;
      };
    };
  };
}>;
export type PatientProcedureResponseWithDetails =
  Prisma.PatientProcedureGetPayload<{
    include: {
      patientProcedureDetails: {
        where: {
          isActive: true;
        };
      };
      appointment: {
        include: {
          doctor: true;
        };
      };
      patient: true;
      patientInsurance: {
        include: {
          insurance: true;
        };
      };
      collectionCenter: true;
      client: true;
    };
  }>;

export interface PatientProcedureReturnInput {
  ccId: number;
  id: number;
  detailId: number[];
  existing: PatientProcedureResponse;
}
