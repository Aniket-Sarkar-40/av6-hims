import {
  ConsultationICDTenListDTO,
  ConsultationICDTenListResponse,
} from "@/types/appointment/consultationICDTenList.js";
import { customOmit, toIdValue } from "av6-utils";
import { toICDTenDropdownDTO } from "../master/icdTen.mapper.js";
import { toAppointmentDetailsDto } from "./appointment.mapper.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";

export const toConsultationICDTenListDTO = async (
  consultationICDTenList: ConsultationICDTenListResponse,
): Promise<ConsultationICDTenListDTO> => {
  const omittedItemStore = customOmit<
    ConsultationICDTenListResponse,
    | "isActive"
    | "deletedBy"
    | "deletedAt"
    | "createdBy"
    | "appointmentId"
    | "icdTenId"
    | "createdAt"
    | "updatedAt"
  >(consultationICDTenList, [
    "isActive",
    "deletedBy",
    "deletedAt",
    "createdBy",
    "appointmentId",
    "icdTenId",
    "createdAt",
    "updatedAt",
  ]);

  const createdBy = consultationICDTenList.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        consultationICDTenList.createdBy,
        true,
      )
    : null;
  const updatedBy = consultationICDTenList.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        consultationICDTenList.updatedBy,
        true,
      )
    : null;
  const appointment = consultationICDTenList.appointment
    ? toAppointmentDetailsDto(consultationICDTenList.appointment)
    : null;

  const icdTen = consultationICDTenList.icdTen
    ? toICDTenDropdownDTO(consultationICDTenList.icdTen)
    : null;

  return {
    ...omittedItemStore.rest,
    createdBy: toIdValue(createdBy, "name"),
    updatedBy: toIdValue(updatedBy, "name"),
    appointment: appointment,
    icdTen,
  };
};
