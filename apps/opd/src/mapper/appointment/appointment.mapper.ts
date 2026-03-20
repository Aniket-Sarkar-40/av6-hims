import { getAppointmentStatsByPatientIdFromDb } from "@/repository/appointment/appointment.repository.js";
import { getFollowUpByAppointmentIdFromDb } from "@/repository/appointment/followUp.repository.js";
import {
  AppointmentDetailsDto,
  AppointmentDto,
  AppointmentResponse,
  LastAppointmentDto,
  LastAppointmentResponse,
} from "@/types/appointment/appointment.js";
import { Appointment } from "@repo/db/generated/prisma/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { applyRound, customOmit, toIdValue } from "av6-utils";
import { toCorporateInternalDto } from "../corporate/corporate.mapper.js";
import { toInsuranceInternalDto } from "../insurance/insurance.mapper.js";
import { toPatientInternalRes } from "../patient/patient.mapper.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";

export const toAppointmentDto = async (
  appointment: AppointmentResponse,
  isVisitStats: boolean = false,
): Promise<AppointmentDto> => {
  const settings = requestStorage.getStore()?.settings;

  const roundFormat = settings?.grnRoundedFormat || "TO_FIXED";
  const precision = settings?.defaultPrecision || 2;
  const createdBy = appointment.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        appointment.createdBy,
        true,
      )
    : null;
  const updatedBy = appointment.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        appointment.updatedBy,
        true,
      )
    : null;
  const deletedBy = appointment.deletedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        appointment.deletedBy,
        true,
      )
    : null;
  const visitStats = isVisitStats
    ? await getAppointmentStatsByPatientIdFromDb(appointment.patientId)
    : null;

  const omittedRes = customOmit<AppointmentResponse, "patientInsurance">(
    appointment,
    ["patientInsurance"],
  );

  const followUp = await getFollowUpByAppointmentIdFromDb(appointment.id);

  return {
    ...omittedRes.rest,
    dueAmount: Math.max(
      applyRound(
        omittedRes.rest.netAmount - omittedRes.rest.paidAmount,
        roundFormat,
        precision,
      ),
      0,
    ),
    cc: toIdValue(appointment.cc, "colName"),
    client: appointment.client
      ? toCorporateInternalDto(appointment.client)
      : null,
    patient: toPatientInternalRes(appointment.patient),
    doctor: toIdValue(appointment.doctor, "name"),
    insurance: appointment.patientInsurance
      ? toInsuranceInternalDto(appointment.patientInsurance)
      : null,
    visitStats: visitStats,
    createdBy: toIdValue(createdBy, "name"),
    updatedBy: toIdValue(updatedBy, "name"),
    deletedBy: toIdValue(deletedBy, "name"),
    followUpDate: followUp?.followUpDate ? followUp.followUpDate : null,
  };
};
export const toLastAppointmentDto = (
  appointment: LastAppointmentResponse,
): LastAppointmentDto => {
  return {
    id: appointment.id,
    appointmentId: appointment.appointmentId,
    selectedDate: appointment.selectedDate,
    selectedTime: appointment.selectedTime,
    appointmentType: appointment.appointmentType,
    status: appointment.status,
    paymentStatus: appointment.paymentStatus,
    referredBy: appointment.referredBy,
    doctor: toIdValue(appointment.doctor, "name"),
    cc: toIdValue(appointment.cc, "colName"),
    patient: toIdValue(appointment.patient, "patientName"),
  };
};

export const toAppointmentDetailsDto = (
  appointment: Appointment,
): AppointmentDetailsDto => {
  return {
    id: appointment.id,
    appointmentNo: appointment.appointmentId,
    date: appointment.selectedDate,
  };
};
