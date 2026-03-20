import {
  PatientMedicine,
  PatientMedicineDetail,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { ItemData } from "../item.js";
import { SellDetails } from "../master/sell.js";
import { AppointmentDetailsDto } from "./appointment.js";
import { IdValue } from "@repo/shared/types/global.js";

export type CreatePatientMedicineDetailInput = Omit<
  Prisma.PatientMedicineDetailUncheckedCreateInput,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "masterId"
>;

export type PatientMedicineInput = Omit<
  Prisma.PatientMedicineUncheckedCreateWithoutDetailsInput,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
>;

export interface CreatePatientMedicineInput extends PatientMedicineInput {
  details: CreatePatientMedicineDetailInput[];
}

export interface UpdatePatientMedicineDetailInput extends Omit<
  Prisma.PatientMedicineDetailUncheckedCreateInput,
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
> {
  id?: number;
}

export interface UpdatePatientMedicineInput extends Omit<
  Prisma.PatientMedicineUncheckedCreateWithoutDetailsInput,
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "appointment"
> {
  id: number;
  details: UpdatePatientMedicineDetailInput[];

  toCreate?: UpdatePatientMedicineDetailInput[];
  toUpdate?: UpdatePatientMedicineDetailInput[];
  toDelete?: number[];
}

export type PatientMedicineDetailDto = Omit<
  PatientMedicineDetail,
  | "masterId"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "medId"
  | "sellId"
  | "sellRefNo"
> & {
  med: ItemData | null;
  sell: SellDetails | null;
};

export type PatientMedicineDto = Omit<
  PatientMedicine,
  | "appointmentId"
  | "patientId"
  | "doctorId"
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
> & {
  doctor: IdValue | null;
  appointment: AppointmentDetailsDto | null;
  details: PatientMedicineDetailDto[];
};

export interface SearchMedicineInput {
  ccId: number;
  aptId: number;
  searchText: string | null;
}

export type PatientMedicineResponse = Prisma.PatientMedicineGetPayload<{
  include: {
    appointment: true;
    details: {
      where: {
        isActive: true;
      };
    };
    doctor: true;
  };
}>;
