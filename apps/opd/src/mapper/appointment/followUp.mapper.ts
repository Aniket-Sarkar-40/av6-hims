import {
  FollowUpDTO,
  FollowUpWithDoctor,
} from "@/types/appointment/followUp.js";
import { customOmit, toIdValue } from "av6-utils";
import { toAppointmentDetailsDto } from "./appointment.mapper.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";

export const toFollowUpDTO = async (
  followUp: FollowUpWithDoctor,
): Promise<FollowUpDTO> => {
  const omittedFollowUp = customOmit<
    FollowUpWithDoctor,
    | "appointmentId"
    | "isActive"
    | "createdBy"
    | "updatedBy"
    | "deletedBy"
    | "deletedAt"
    | "doctorId"
  >(followUp, [
    "appointmentId",
    "isActive",
    "createdBy",
    "updatedBy",
    "deletedBy",
    "deletedAt",
    "doctorId",
  ]);

  const appointment = followUp.appointment
    ? toAppointmentDetailsDto(followUp.appointment)
    : null;
  const createdBy = followUp.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        followUp.createdBy,
        true,
      )
    : null;
  const updatedBy = followUp.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        followUp.updatedBy,
        true,
      )
    : null;

  return {
    ...omittedFollowUp.rest,
    followUpDate: new Date(followUp.followUpDate),
    createdBy: toIdValue(createdBy, "name"),
    updatedBy: toIdValue(updatedBy, "name"),
    appointment,
    doctor: toIdValue(followUp.doctor, "name"),
  };
};
