import {
  CollectionCenter,
  PmsItemStock,
} from "@repo/db/generated/prisma/client";
import { ItemAppointmentDTO, ItemDTO } from "../item/item.js";

export interface AppointmentMedicineSummary {
  patientName: string;
  age: number;
  dob: string;
  gender: string;
  appointmentNo: string;
  id: number;
  bookedBy: string;
  appointmentType: string;
  appointmentDate: string;
  visitNo?: string;
  appointmentStatus?: string;
  billNo?: string;
  insurerName?: string;
  clientName?: string;
}

export interface AppointmentResponse {
  patientName: string;
  age: number;
  dob: string;
  gender: string;
  appointmentNo: string;
  paymentType: string;
  id: number;
  bookedBy: string;
  appointmentType: string;
  appointmentDate: string;
  visitNo?: string;
  appointmentStatus?: string;
  billNo?: string;
  insurerName?: string;
  clientName?: string;
  ccId: number;
  ccName?: string;
  address?: string;
  ccPhone?: string;
  ccEmail?: string;
}

export interface PaginatedAppointments {
  data: AppointmentMedicineSummary[];
  total: number;
  page: number;
  perPage: number;
}

export interface SearchWithDate {
  startDate?: string;
  endDate?: string;
  ccId?: number;
}
export interface SearchRequestOpd extends SearchWithDate {
  pageNo: number;
  pageSize: number;
  searchText?: string;
  sortDir?: "ASC" | "DESC";
}

export interface OpdBillReq {
  aptId: number;
  branchId?: number;
}

export interface CommonOpdBill {
  id: number;
  patientName: string;
  age: number;
  dob: string;
  gender: string;
  patientId: number;
  appointmentNo: number;
  bookedBy: string;
  doctorId: number;
  patientUniqueId: string;
  patientInsuranceId: number | null;
  patientInsuranceType: string | null;
  insurerId: number | null;
  insurerName: string | null;
  clientId: number | null;
  clientName: string | null;
}

export interface RawOpdBill extends CommonOpdBill {
  medicines: string;
  ccId: string;
}
export interface OpdBill extends CommonOpdBill {
  medicines: Medicine[];
  ccId: number;
}

export interface MedicineInstruction {
  id: number;
  medicineName: string;
  itemNumber: string;
  appointmentId: number;
  morn: number;
  aft: number;
  night: number;
  sos: "SOS" | "No SOS";
  duration?: number;
  notes?: string;
}

export interface RawMedicineInstruction {
  id: string;
  medicineName: string;
  itemNumber: string;
  appointmentId: string;
  morn: string;
  aft: string;
  night: string;
  sos: "SOS" | "No SOS";
  duration?: string;
  notes?: string;
}

export interface Medicine {
  medId: number;
  morningDose: number;
  afternoonDose: number;
  nightDose: number;
  sos: "SOS" | "No SOS";
  duration: string;
  notes: string;
}

export interface NonCompletedMedicine {
  id: number;
  itemNumber: string;
  medicineName: string;
  appointmentNo: string;
  expectedQty: number | null;
  totalSoldQty: number | null;
}

export interface MedicineDto extends Omit<Medicine, "medId"> {
  id: number;
  expectedQty: number | null;
  stocks: PmsItemStock[];
  item: ItemDTO | null;
}

export interface OpdBillDTO extends CommonOpdBill {
  medicines: MedicineDto[];
}

export interface AppointmentDosageDto extends CommonOpdBill {
  medicine: MedicineAppointment[];
  collectionCenter: CollectionCenter | null;
}

export interface MedicineAppointment {
  med: ItemAppointmentDTO | null;
  morningDose: number;
  afternoonDose: number;
  nightDose: number;
  sos: "SOS" | "No SOS";
  duration: string;
  notes: string;
}

export interface LastAppointmentRes {
  patientName: string;
  doctorName: string;
  appointmentId: string;
  ccName: string;
  dateOfVisit: string;
  referredBy?: string;
  appointmentType?: string;
  visitId?: string;
  appointmentPaymentStatus: string;
}
