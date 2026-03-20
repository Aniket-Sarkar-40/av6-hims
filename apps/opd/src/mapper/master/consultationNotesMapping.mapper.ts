import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { consultationNotesService } from "@/services/master/consultationNotes.service.js";
import {
  ConsultationNotesMappingDTO,
  ConsultationNotesMappingRes,
} from "@/types/master/consultationNotesMapping.js";
import { customOmit, toIdValue } from "av6-utils";
export const toConstMappingDTO = async (
  inputs: ConsultationNotesMappingRes,
): Promise<ConsultationNotesMappingDTO> => {
  const omittedConst = customOmit<
    ConsultationNotesMappingRes,
    | "isActive"
    | "deletedBy"
    | "deletedAt"
    | "createdBy"
    | "doctorId"
    | "createdAt"
    | "updatedAt"
    | "consultationNotesId"
  >(inputs, [
    "isActive",
    "deletedBy",
    "deletedAt",
    "createdBy",
    "doctorId",
    "createdAt",
    "updatedAt",
    "consultationNotesId",
  ]);
  const createdBy = inputs.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(inputs.createdBy, true)
    : null;
  const updatedBy = inputs.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(inputs.updatedBy, true)
    : null;

  const note = inputs.consultationNotesId
    ? await consultationNotesService.getConsultationNotesById(
        inputs.consultationNotesId,
        true,
      )
    : null;

  return {
    ...omittedConst.rest,
    doctor: inputs.doctor ? toIdValue(inputs.doctor, "name") : null,
    createdBy: createdBy ? toIdValue(createdBy, "name") : null,
    updatedBy: updatedBy ? toIdValue(updatedBy, "name") : null,
    consultationNotes: toIdValue(note, "consultationName"),
  };
};
