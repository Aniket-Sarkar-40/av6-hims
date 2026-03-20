import {
  BookedStatus,
  ClientMaster,
  PaymentStatus,
  PercentageOrAmount,
  ReferredBy,
} from "@repo/db/generated/prisma/client";

export interface DoctorConsultationWithTimeSlotInput {
  docId: number;
  ccId: number;
  weekId: number;
  date: Date;
  patientType: ReferredBy;
  isVIPBooking: boolean;
  isSpecialBooking: boolean;
  isFOCConsultation: boolean;
  taxMethod: "INCLUSIVE" | "EXCLUSIVE";
  taxValue?: number;
  clientId?: number;
  insuranceId?: number;

  client?: ClientMaster | null;
}

export interface TimeSlotInput {
  docId: number;
  ccId: number;
  date: Date;
}

export interface TimeSlotMapperResponse {
  slotTime: string;
  status: BookedStatus;
  paymentStatus?: PaymentResStatus | null;
}

export interface DoctorConsultationWithTimeSlotResponse {
  charges: DoctorChargeRes;
  timeSlots: TimeSlotMapperResponse[];
}

export interface DoctorChargeRes {
  baseFee: number | null;
  vipSpecialFee: number | null;
  coPaymentMethod: PercentageOrAmount | null;
  coPaymentValue: number | null;
}

export interface WeekIdInput {
  docId: number;
  ccId: number;
}
export type WeekIdsRes = number[];

export enum PatientType {
  NEW = "NEW",
  FOLLOW_UP = "FOLLOW_UP",
}

export enum PaymentResStatus {
  BOOKED_WITH_MONEY = "BOOKED_WITH_MONEY",
  BOOKED_WITHOUT_MONEY = "BOOKED_WITHOUT_MONEY",
}

export interface AppointmentStatusRecord {
  selectedTime: string;
  paymentStatus: PaymentStatus;
}
