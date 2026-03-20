import {
  AppointmentType,
  CoPaymentSource,
  ServiceCode,
  PaymentStatus,
  PercentageOrAmount,
  Prisma,
  TAX_METHOD,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";
import { PatientInternalRes } from "../patient/patient.js";
import { InsuranceResponse } from "../insurance/insurance.js";
import { ClientInternalRes } from "../appointment/appointment.js";
export interface GetPaymentReq {
  ccId: number;
  pageNo: number;
  pageSize: number;
  paymentStatus: PaymentStatus;
  sortBy: "ASC" | "DESC";
  searchText?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaymentResponse {
  module: ServiceCode;
  id: number;
  refNo: string;
  refId: number | null;
  refDate: Date;
  billNo: string;
  visitType: AppointmentType | null;
  patientId: number;
  patientName: string;
  patientMobileNo: string;

  totalAmount: number;
  discountAmount: number;
  coPaymentAmount: number;
  paidAmount: number;
  dueAmount: number;
  refundAmount: number;
  refundedAmount: number;

  paymentStatus:
    | "PENDING"
    | "PARTIAL"
    | "UNPAID"
    | "PAID"
    | "SETTLED"
    | "REFUND";
  createdAt: Date;
  createdBy: IdValue | null;
}

export type PaymentDetailInput = Pick<
  Prisma.PaymentTransactionUncheckedCreateInput,
  | "paymentMode"
  | "paidAmount"
  | "refundAmount"
  | "bankName"
  | "accountNumber"
  | "cardNo"
  | "cardHolderName"
  | "cardExpiryDate"
  | "transactionId"
  | "netAmount"
  | "dueAmount"
  | "bankHeadId"
  | "mobileMoneyMethodId"
>;
export type CreatePaymentInput = Pick<
  Prisma.PaymentTransactionUncheckedCreateInput,
  | "module"
  | "referenceId"
  | "referenceNumber"
  | "patientId"
  | "ccId"
  | "remarks"
  | "transactionType"
> & {
  totalPaidAmount: number;
  totalRefundAmount: number;
  paymentStatus: string;
  details: PaymentDetailInput[];
};

export interface GetPaymentDetailsReq {
  module: ServiceCode;
  id: number;
}

export interface PaymentDetailsResponse {
  module: ServiceCode;
  refId: number;
  refNo: string;
  billNo: string | null;
  refDate: Date | null;
  ccId: number;
  visitType: AppointmentType | null;

  additionalDiscountMode: PercentageOrAmount | null;
  additionalDiscountValue: number | null;

  subtotalAmount: number;
  otherChargeAmount: number;
  discountTotalAmount: number;

  taxAmount: number;
  grossAmount: number;
  netAmount: number;
  coPaymentAmount: number;

  paidAmount: number;
  refundAmount: number;
  refundedAmount: number;

  patient: PatientInternalRes;
  doctor: IdValue | null;
  insurance: InsuranceResponse | null;
  client: ClientInternalRes | null;
  status: string;
  paymentStatus: string;
  lastUpdatedBy: IdValue | null;
  lastUpdatedAt: Date | null;
  collectionCenter: IdValue | null;

  details: PaymentDetailsChildResponse[];
}

export interface PaymentDetailsChildResponse {
  id: number;
  masterId: number;
  itemId: number;
  itemName: string;
  qty?: number;
  totalQty?: number;
  returnQty?: number;
  rate?: number;

  subtotalAmount: number;
  otherChargeAmount: number;

  discountMode: PercentageOrAmount | null;
  discountValue: number;
  discountAmount: number;

  taxMethod: TAX_METHOD | null;
  taxValue: number;
  taxAmount: number;

  grossAmount: number;
  netAmount: number;

  coPaymentMode: PercentageOrAmount | null;
  coPaymentValue: number;
  coPaymentAmount: number;
  coPaymentSource: CoPaymentSource | null;
  isReturned: boolean;
}
