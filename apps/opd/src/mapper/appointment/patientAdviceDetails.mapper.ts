import {
  PatientAdviceDetailsDTO,
  PatientAdviceDetailsRes,
} from "@/types/appointment/patientAdviceDetails.js";
import { customOmit, toIdValue } from "av6-utils";
import { toAppointmentDetailsDto } from "./appointment.mapper.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";

export const toPatientAdviceDetailsDTO = async (
  patientAdviceDetails: PatientAdviceDetailsRes,
): Promise<PatientAdviceDetailsDTO> => {
  const omittedItemStore = customOmit<
    PatientAdviceDetailsRes,
    "isActive" | "deletedBy" | "deletedAt" | "createdBy"
  >(patientAdviceDetails, ["isActive", "deletedBy", "deletedAt", "createdBy"]);

  const createdBy = patientAdviceDetails.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        patientAdviceDetails.createdBy,
        true,
      )
    : null;
  const updatedBy = patientAdviceDetails.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        patientAdviceDetails.updatedBy,
        true,
      )
    : null;

  const appointment = patientAdviceDetails.appointment
    ? toAppointmentDetailsDto(patientAdviceDetails.appointment)
    : null;

  return {
    ...omittedItemStore.rest,
    createdBy: toIdValue(createdBy, "name"),
    updatedBy: toIdValue(updatedBy, "name"),
    appointment,
  };
};
