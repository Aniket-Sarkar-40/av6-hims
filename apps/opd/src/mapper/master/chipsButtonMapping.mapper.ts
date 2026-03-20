import { employeeService } from "@apps/core/services/staff/employee.service.js";
import {
  chipsButtonMappingDTO,
  chipsButtonMappingRes,
} from "@/types/master/chipsButtonMapping.js";
import { customOmit, toIdValue } from "av6-utils";

export const toChipsButtonDTO = async (
  chipsButtonMapping: chipsButtonMappingRes,
): Promise<chipsButtonMappingDTO> => {
  const omittedItemStore = customOmit<
    chipsButtonMappingRes,
    "isActive" | "deletedBy" | "deletedAt" | "createdBy" | "doctorId"
  >(chipsButtonMapping, [
    "isActive",
    "deletedBy",
    "deletedAt",
    "createdBy",
    "doctorId",
  ]);

  const createdBy = chipsButtonMapping.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        chipsButtonMapping.createdBy,
        true,
      )
    : null;
  const updatedBy = chipsButtonMapping.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        chipsButtonMapping.updatedBy,
        true,
      )
    : null;

  return {
    ...omittedItemStore.rest,
    createdBy: toIdValue(createdBy, "name"),
    updatedBy: toIdValue(updatedBy, "name"),
    doctor: chipsButtonMapping.doctor
      ? toIdValue(chipsButtonMapping.doctor, "name")
      : null,
  };
};
