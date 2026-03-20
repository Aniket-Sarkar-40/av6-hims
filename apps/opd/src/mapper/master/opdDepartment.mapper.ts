import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { OpdDepartmentDTO } from "@/types/master/opdDepartment.js";
import { customOmit, toIdValue } from "av6-utils";
import { OpdDepartment } from "@repo/db/generated/prisma/client";

export const toOpdDepartmentDTO = async (
  opdDepartment: OpdDepartment,
): Promise<OpdDepartmentDTO> => {
  const omittedItemStore = customOmit<
    OpdDepartment,
    "isActive" | "deletedBy" | "deletedAt" | "createdBy"
  >(opdDepartment, ["isActive", "deletedBy", "deletedAt", "createdBy"]);

  const createdBy = opdDepartment.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        opdDepartment.createdBy,
        true,
      )
    : null;
  const updatedBy = opdDepartment.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        opdDepartment.updatedBy,
        true,
      )
    : null;

  return {
    ...omittedItemStore.rest,
    createdBy: toIdValue(createdBy, "name"),
    updatedBy: toIdValue(updatedBy, "name"),
  };
};
