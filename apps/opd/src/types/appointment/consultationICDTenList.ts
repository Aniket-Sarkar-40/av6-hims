import {
  ConsultationICDTenList,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";
import { AppointmentDetailsDto } from "./appointment.js";
import { ICDTenDropdownDTO } from "../master/icdTen.js";

export type CreateOrUpdateConsultationICDTenList = Omit<
  Prisma.ConsultationICDTenListUncheckedCreateInput,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export interface ConsultationICDTenListDTO extends Omit<
  ConsultationICDTenList,
  | "isActive"
  | "deletedAt"
  | "deletedBy"
  | "createdBy"
  | "updatedBy"
  | "icdTenId"
  | "appointmentId"
  | "createdAt"
  | "updatedAt"
> {
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
  appointment: AppointmentDetailsDto | null;
  icdTen: ICDTenDropdownDTO | null;
}

export type ConsultationICDTenListResponse =
  Prisma.ConsultationICDTenListGetPayload<{
    include: {
      appointment: true;
      icdTen: true;
    };
  }>;
