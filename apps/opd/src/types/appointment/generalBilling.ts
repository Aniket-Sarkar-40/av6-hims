import {
  GeneralBilling,
  GeneralBillingDetails,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";

export type GeneralBillingDetailsInput = Omit<
  Prisma.GeneralBillingDetailsUncheckedCreateWithoutGeneralBillingInput,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "isRefunded"
>;

export type GeneralBillingInput = Omit<
  Prisma.GeneralBillingUncheckedCreateWithoutGeneralBillingDetailsInput,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "billNumber"
  | "paidAmount"
  | "refundAmount"
  | "refundedAmount"
  | "paymentStatus"
  | "status"
>;

export interface GeneralBillingCreateInput extends GeneralBillingInput {
  generalBillingDetails: GeneralBillingDetailsInput[];
}

export interface GeneralBillingUpdateInput extends GeneralBillingCreateInput {
  id: number;
  existing: GeneralBillingResponse;
}
export type GeneralBillingForValidation =
  | GeneralBillingCreateInput
  | GeneralBillingUpdateInput;

export const isUpdateInput = (
  input: GeneralBillingForValidation,
): input is GeneralBillingUpdateInput => {
  return "existing" in input && !!input.existing;
};
export type GeneralBillingResponse = Prisma.GeneralBillingGetPayload<{
  include: {
    generalBillingDetails: {
      where: {
        isActive: true;
      };
    };
    collectionCenter: true;
    patient: true;
  };
}>;
export type GeneralBillingWithDetailsResponse =
  Prisma.GeneralBillingGetPayload<{
    include: {
      generalBillingDetails: {
        where: {
          isActive: true;
        };
        include: {
          generalBillItem: true;
        };
      };
      collectionCenter: true;
      patient: true;
    };
  }>;

export type GeneralBillingDetailDto = Omit<
  GeneralBillingDetails,
  | "generalBillingId"
  | "generalBillItemId"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
> & {
  generalBillItem: IdValue | null;
};

export type GeneralBillingDto = Omit<
  GeneralBilling,
  | "ccId"
  | "patientId"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
> & {
  collectionCenter: IdValue | null;
  patient: IdValue | null;
  details: GeneralBillingDetailDto[];
};

export interface GeneralBillingReturnInput {
  ccId: number;
  id: number;
  detailId: number[];
  existing: GeneralBillingResponse;
}
