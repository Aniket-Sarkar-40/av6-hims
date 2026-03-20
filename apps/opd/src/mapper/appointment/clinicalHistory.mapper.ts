import {
  ClinicalHistoryDTO,
  ClinicalHistoryResponse,
} from "@/types/appointment/clinicalHistory.js";
import { customOmit, toIdValue } from "av6-utils";
import { toAppointmentDetailsDto } from "./appointment.mapper.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";

export const toClinicalHistoryDTO = async (
  clinicalHistory: ClinicalHistoryResponse,
): Promise<ClinicalHistoryDTO> => {
  const omittedClinicalHistory = customOmit<
    ClinicalHistoryResponse,
    | "appointmentId"
    | "isActive"
    | "createdBy"
    | "updatedBy"
    | "deletedBy"
    | "deletedAt"
  >(clinicalHistory, [
    "appointmentId",
    "isActive",
    "createdBy",
    "updatedBy",
    "deletedBy",
    "deletedAt",
  ]);

  const createdBy = clinicalHistory.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        clinicalHistory.createdBy,
        true,
      )
    : null;
  const updatedBy = clinicalHistory.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        clinicalHistory.updatedBy,
        true,
      )
    : null;

  const appointment = clinicalHistory.appointment
    ? toAppointmentDetailsDto(clinicalHistory.appointment)
    : null;

  return {
    ...omittedClinicalHistory.rest,
    appointment,
    createdBy: toIdValue(createdBy, "name"),
    updatedBy: toIdValue(updatedBy, "name"),
  };
};
