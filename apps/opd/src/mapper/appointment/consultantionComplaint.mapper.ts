import {
  ConsultationComplaintResponse,
  ConsultationComplaintsDTO,
} from "@/types/appointment/consultationComplaint.js";
import { customOmit, toIdValue } from "av6-utils";
import { toAppointmentDetailsDto } from "./appointment.mapper.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";

export const toConsultationComplaintDTO = async (
  consultationComplaint: ConsultationComplaintResponse,
): Promise<ConsultationComplaintsDTO> => {
  const omittedItemStore = customOmit<
    ConsultationComplaintResponse,
    | "isActive"
    | "deletedBy"
    | "deletedAt"
    | "createdBy"
    | "appointmentId"
    | "patientId"
  >(consultationComplaint, [
    "isActive",
    "deletedBy",
    "deletedAt",
    "createdBy",
    "appointmentId",
    "patientId",
  ]);

  const createdBy = consultationComplaint.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        consultationComplaint.createdBy,
        true,
      )
    : null;
  const updatedBy = consultationComplaint.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        consultationComplaint.updatedBy,
        true,
      )
    : null;
  const appointment = consultationComplaint.appointment
    ? toAppointmentDetailsDto(consultationComplaint.appointment)
    : null;

  return {
    ...omittedItemStore.rest,
    createdBy: toIdValue(createdBy, "name"),
    updatedBy: toIdValue(updatedBy, "name"),
    appointment,
  };
};
