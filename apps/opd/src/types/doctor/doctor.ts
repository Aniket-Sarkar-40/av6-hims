import {
  DoctorSchedule,
  Prisma,
  StaffCollectionCenter,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";
import { EmployeeCache } from "../employee.js";
import { OpdDepartmentPrefixDTO } from "../master/opdDepartmentPrefix.js";

export interface CreateDoctorInput {
  name: string;
  gender: string;
  contactNo: string;
  email: string;
  doctorRegistrationNo: string;
  address: string;
  collectionCenterIds: number[]; //for multiple  staff collection center mapping
  checkUpTime: number;
  opdPrimaryDepartmentId: number;
  opdDepartmentId: number;
  opdDepartmentPrefixId: number;
  licenseType: string;
  doctorScheduleDetails: CreateDoctorScheduleInput[];
}

export type CreateDoctorScheduleInput = Omit<
  Prisma.DoctorScheduleUncheckedCreateInput,
  "id" | "docId" | "createdAt" | "updatedAt"
>;
export interface UpdateDoctorScheduleInput extends CreateDoctorScheduleInput {
  id?: number;
}
export interface UpdateDoctorInput extends CreateDoctorInput {
  id: number;
  doctorScheduleDetails: UpdateDoctorScheduleInput[];
  existingDoctor: DoctorResponse;
}

export type DoctorResponse = Prisma.StaffGetPayload<{
  include: {
    doctorSchedule: {
      where: {
        isActive: true;
      };
    };
    staffCollectionCenter: {
      where: {
        isActive: "true";
      };
    };
  };
}>;

export interface DoctorScheduleDTO extends Omit<
  DoctorSchedule,
  "isActive" | "createdBy" | "updatedBy" | "deletedBy" | "deletedAt"
> {
  collectionCenter: IdValue | null;
  createdBy: EmployeeCache | null;
  updatedBy: EmployeeCache | null;
}
export interface StaffCollectionCenterDTO extends Omit<
  StaffCollectionCenter,
  "isActive"
> {
  collectionCenter: IdValue | null;
}

export interface DoctorDTO {
  id: number;
  employeeId: string;
  name: string;
  gender: string | null;
  contactNo: string | null;
  email: string;
  doctorRegistrationNo: string | null;
  address: string | null;
  licenseName: string | null;
  checkUpTime: number;
  opdDepartment: IdValue | null;
  opdDepartmentPrefix: OpdDepartmentPrefixDTO | null;
  doctorSchedule: DoctorScheduleDTO[];
  staffCollectionCenter: StaffCollectionCenterDTO[];
}
