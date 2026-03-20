import { opdDepartmentService } from "@/services/master/opdDepartment.service.js";
import {
  ReferToDoctorDTO,
  ReferToDoctorResponse,
} from "@/types/appointment/referToDoctor.js";
import { customOmit, toIdValue } from "av6-utils";
import { toAppointmentDetailsDto } from "./appointment.mapper.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";

export const toReferToDoctorDTO = async (
  referToDoctor: ReferToDoctorResponse,
): Promise<ReferToDoctorDTO> => {
  const omittedReferToDoctor = customOmit<
    ReferToDoctorResponse,
    | "appointmentId"
    | "isActive"
    | "createdBy"
    | "updatedBy"
    | "deletedBy"
    | "deletedAt"
    | "opdDepartmentId"
    | "doctorId"
  >(referToDoctor, [
    "appointmentId",
    "isActive",
    "createdBy",
    "updatedBy",
    "deletedBy",
    "deletedAt",
    "opdDepartmentId",
    "doctorId",
  ]);

  const appointment = referToDoctor.appointment
    ? toAppointmentDetailsDto(referToDoctor.appointment)
    : null;
  const opdDepartment =
    await opdDepartmentService.getOpdDepartmentByIdWithOutDto(
      referToDoctor.opdDepartmentId,
      true,
    );
  const doctor = referToDoctor.doctor
    ? toIdValue(referToDoctor.doctor, "name")
    : null;
  const createdBy = referToDoctor.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        referToDoctor.createdBy,
        true,
      )
    : null;
  const updatedBy = referToDoctor.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        referToDoctor.updatedBy,
        true,
      )
    : null;

  return {
    ...omittedReferToDoctor.rest,
    appointment,
    opdDepartment: toIdValue(opdDepartment, "departmentName"),
    doctor,
    createdBy: toIdValue(createdBy, "name"),
    updatedBy: toIdValue(updatedBy, "name"),
  };
};
