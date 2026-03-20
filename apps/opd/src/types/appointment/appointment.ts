import {
  Appointment,
  ClientMaster,
  PaymentStatus,
  PercentageOrAmount,
  Prisma,
  ReferredBy,
  TAX_METHOD,
} from "@repo/db/generated/prisma/client";

import { ChildCalculated } from "av6-utils";
import { IdValue } from "@repo/shared/types/global.js";
import { InsuranceResponse } from "../insurance/insurance.js";
import { PatientInternalRes } from "../patient/patient.js";

export type CreateAppointmentsTableInput = Omit<
  Prisma.AppointmentUncheckedCreateInput,
  | "appointmentId"
  | "visitId"
  | "billId"
  | "paidAmount"
  | "refundedAmount"
  | "refundAmount"
  | "procedureStatus"
  | "pharmacyStatus"
  | "isMigrated"
  | "cancellationReason"
  | "cancelledBy"
  | "cancelledAt"
  | "coPaymentSource"
  | "isRescheduled"
  | "isActive"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "deletedBy"
  | "createdBy"
  | "updatedBy"
>;

export interface AppointmentDto extends Omit<
  AppointmentResponse,
  | "patient"
  | "client"
  | "doctor"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "insurance"
  | "cc"
  | "patientInsurance"
> {
  dueAmount: number | null;
  cc: IdValue | null;
  patient: PatientInternalRes | null;
  client: ClientInternalRes | null;
  doctor: IdValue | null;
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
  deletedBy: IdValue | null;
  insurance: InsuranceResponse | null;
  visitStats: AppointmentStats | null;
  followUpDate: Date | null;
}

export type ClientInternalRes = Pick<
  ClientMaster,
  | "id"
  | "customerName"
  | "customerCode"
  | "contactNo"
  | "email"
  | "customerPlan"
  | "status"
>;

export interface AppointmentStatus {
  selectedTime: string;
  paymentStatus: PaymentStatus;
}

export type AppointmentResponse = Prisma.AppointmentGetPayload<{
  include: {
    patient: true;
    client: true;
    doctor: true;
    patientInsurance: {
      include: {
        insurance: true;
      };
    };
    cc: true;
  };
}>;

export interface AppointmentDetailsDto {
  id: number;
  appointmentNo: string;
  date: Date | string;
}

export interface AppointmentStats {
  visitCount: number;
  lastVisitedDate: Date | null;
}

export interface RescheduleAppointmentInput extends Pick<
  Prisma.AppointmentUncheckedCreateInput,
  | "id"
  | "ccId"
  | "doctorId"
  | "selectedDate"
  | "selectedTime"
  | "weekId"
  | "netAmount"
  | "taxAmount"
  | "grossAmount"
  | "discountTotalAmount"
  | "coPaymentAmount"
  | "subtotalAmount"
  | "otherChargeAmount"
> {
  existingAppointment: Appointment | null;
}

export interface RescheduleValidatedPayload {
  aptDbId: number;
  patientId: number;
  ccId: number;
  selectedDate: Date;
  selectedTime: string;
  prevSelectedDate: Date;
  prevSelectedTime: string;
  oldDoctorId: number;
  newDoctorId: number;
  weekId: number;
  consultationFee: number;
  isRescheduled: boolean;
  isMigrated: boolean;
}

export interface ConvertAppointmentToVipOrSpecial {
  isVipBooking: boolean;
  isSpecialBooking: boolean;
  appointmentId: number;
}

export interface ConvertAppointmentToVipOrSpecialValidatedPayload {
  aptDbId: number;
  isVipBooking: boolean;
  isSpecialBooking: boolean;
  netAmount: number;
  vipSpecialFee: number;
  coPaymentType: string | null;
  coPaymentValue: number | null;
  coPaymentAmount: number | null;
  paidAmount: number;
  dueAmount: number | null;
  paymentStatus: string;
  isFoc: boolean;
}

export interface GetAppointmentChargesInput {
  doctorId: number;
  ccId: number;
  weekId: number;
  patientType: ReferredBy;
  insuranceId?: number;
  clientId?: number;
  bookingType: BookingType;
  isFoc: boolean;
  client?: ClientMaster | null;
  discountMethod: PercentageOrAmount;
  discountValue: number;
  taxMethod: TAX_METHOD;
  taxPercent: number;
}

export type BookingType = "VIP" | "SPECIAL" | "REGULAR";

export interface AppointmentChargesResponse extends ChildCalculated {
  coPaymentMethod: PercentageOrAmount | null;
  coPaymentValue: number | null;
}

export interface LastAppointmentDto extends Pick<
  Appointment,
  | "id"
  | "appointmentId"
  | "selectedDate"
  | "selectedTime"
  | "appointmentType"
  | "status"
  | "paymentStatus"
  | "referredBy"
> {
  doctor: IdValue | null;
  cc: IdValue | null;
  patient: IdValue | null;
}

export type LastAppointmentResponse = Prisma.AppointmentGetPayload<{
  include: {
    patient: true;
    doctor: true;
    cc: true;
  };
}>;
export interface CancelAppointmentReq {
  id: number;

  appointment?: Appointment;
  newPaymentStatus?: PaymentStatus;
}

export interface UpgradeAppointmentReq {
  appointmentId: number;
  isVipBooking: boolean;
  isSpecialBooking: boolean;
}
export type GetAppointmentFeesInput = Omit<
  GetAppointmentChargesInput,
  | "client"
  | "discountMethod"
  | "discountValue"
  | "taxMethod"
  | "taxPercent"
  | "bookingType"
>;

export interface DoctorCharge {
  regConsultationFee: number;
  vipSpecialFee: number;
}
export interface AppointmentFeesResponse {
  vipCharges: DoctorCharge;
  specialCharges: DoctorCharge;
}
