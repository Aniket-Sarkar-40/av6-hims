import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { pathologyMasterService } from "@/services/pathology/pathologyMaster.service.js";
import {
  PatientTestDTO,
  PatientTestResponse,
  RawSearchTestResult,
  SearchTestDTO,
} from "@/types/appointment/investigation.js";
import { customOmit, toIdValue } from "av6-utils";
import { toAppointmentDetailsDto } from "./appointment.mapper.js";

export const toSearchTestDTO = (input: RawSearchTestResult): SearchTestDTO => {
  return {
    id: input.id,
    testCode: input.testCode,
    testName: input.testName,
    rate: parseFloat(input.rate),
    department: input.department,
    isCommentRequired: input.isCommentRequired === "Yes" ? true : false,
  };
};

export const toPatientTestDTO = async (
  input: PatientTestResponse,
): Promise<PatientTestDTO> => {
  const omittedInput = customOmit<
    PatientTestResponse,
    | "isActive"
    | "createdBy"
    | "updatedBy"
    | "deletedBy"
    | "deletedAt"
    | "processLocation"
    | "testCode"
    | "testName"
    | "appointment"
    | "collectionCenter"
  >(input, [
    "isActive",
    "createdBy",
    "updatedBy",
    "deletedBy",
    "deletedAt",
    "processLocation",
    "testCode",
    "testName",
    "appointment",
    "collectionCenter",
  ]);

  const { appointment, collectionCenter } = omittedInput.omitted;

  const patho = await pathologyMasterService.getPathologyMasterById(
    input.testId,
    true,
  );

  const createdBy = input.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(input.createdBy, true)
    : null;
  const updatedBy = input.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(input.updatedBy, true)
    : null;
  return {
    ...omittedInput.rest,
    appointment: toAppointmentDetailsDto(appointment),
    processLocation: collectionCenter
      ? toIdValue(collectionCenter, "colName")
      : null,
    testDetails: patho,
    createdBy: createdBy ? toIdValue(createdBy, "name") : null,
    updatedBy: updatedBy ? toIdValue(updatedBy, "name") : null,
  };
};
