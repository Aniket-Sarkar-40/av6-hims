import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { ConsultationNotesDTO } from "@/types/master/consultationNotes.js";
import { customOmit, toIdValue } from "av6-utils";
import { ConsultationNotes } from "@repo/db/generated/prisma/client";

export const toConsultationNotesDTO = async (
  consultationNotes: ConsultationNotes,
): Promise<ConsultationNotesDTO> => {
  const omittedNotes = customOmit<
    ConsultationNotes,
    "isActive" | "deletedBy" | "deletedAt" | "createdBy" | "updatedBy"
  >(consultationNotes, [
    "isActive",
    "deletedBy",
    "deletedAt",
    "createdBy",
    "updatedBy",
  ]);

  const createdBy = consultationNotes.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        consultationNotes.createdBy,
        true,
      )
    : null;
  const updatedBy = consultationNotes.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        consultationNotes.updatedBy,
        true,
      )
    : null;

  return {
    ...omittedNotes.rest,
    createdBy: toIdValue(createdBy, "name"),
    updatedBy: toIdValue(updatedBy, "name"),
  };
};
