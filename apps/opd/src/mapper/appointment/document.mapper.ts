import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { BASE_URL } from "@repo/shared/config/index.js";
import {
  DocumentMasterDTO,
  DocumentMasterEntityWoPatient,
  DocumentMasterReqWoPatient,
  DocumentResponse,
} from "@/types/appointment/document.js";
import { customOmit, toIdValue } from "av6-utils";
import { DocumentName } from "@repo/db/generated/prisma/client";
import { toAppointmentDetailsDto } from "./appointment.mapper.js";

export const toDocumentEntity = (
  doc: DocumentMasterEntityWoPatient,
): DocumentMasterReqWoPatient => {
  return {
    documentType: doc.documentType as DocumentName,
    appointmentId: Number(doc.appointmentId),
    filePath: doc.filePath,
  };
};

export const toDocumentDTO = async (
  document: DocumentResponse,
): Promise<DocumentMasterDTO> => {
  const omittedDocument = customOmit<
    DocumentResponse,
    "isActive" | "deletedBy" | "deletedAt" | "createdBy" | "updatedBy"
  >(document, ["isActive", "deletedBy", "deletedAt", "createdBy", "updatedBy"]);

  const filePath = BASE_URL + document.filePath.replace(/\\/g, "/");
  const appointment = document.appointment
    ? toAppointmentDetailsDto(document.appointment)
    : null;

  const createdBy = document.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        document.createdBy,
        true,
      )
    : null;
  const updatedBy = document.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        document.updatedBy,
        true,
      )
    : null;

  return {
    ...omittedDocument.rest,
    createdBy: toIdValue(createdBy, "name"),
    updatedBy: toIdValue(updatedBy, "name"),
    appointment: appointment,
    patient: toIdValue(document.patient, "patientName"),
    filePath: filePath,
  };
};
