import {
  PatientConsultationDTO,
  PatientConsultationRes,
} from "@/types/appointment/patientConsultation.js";
import { customOmit, toIdValue } from "av6-utils";
import { toAppointmentDetailsDto } from "./appointment.mapper.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";

export const toPatientConsultationDTO = async (
  patientConsultation: PatientConsultationRes,
): Promise<PatientConsultationDTO> => {
  const omittedItemStore = customOmit<
    PatientConsultationRes,
    | "isActive"
    | "deletedBy"
    | "deletedAt"
    | "createdBy"
    | "appointmentId"
    | "patientId"
  >(patientConsultation, [
    "isActive",
    "deletedBy",
    "deletedAt",
    "createdBy",
    "appointmentId",
    "patientId",
  ]);

  const createdBy = patientConsultation.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        patientConsultation.createdBy,
        true,
      )
    : null;
  const updatedBy = patientConsultation.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        patientConsultation.updatedBy,
        true,
      )
    : null;

  const appointment = patientConsultation.appointment
    ? toAppointmentDetailsDto(patientConsultation.appointment)
    : null;

  return {
    ...omittedItemStore.rest,
    createdBy: toIdValue(createdBy, "name"),
    updatedBy: toIdValue(updatedBy, "name"),
    appointment,
  };
};
