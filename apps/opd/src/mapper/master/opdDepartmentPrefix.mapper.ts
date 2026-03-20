import { opdDepartmentService } from "@/services/master/opdDepartment.service.js";
import { OpdDepartmentPrefixDTO } from "@/types/master/opdDepartmentPrefix.js";
import { customOmit, toIdValue } from "av6-utils";
import { OpdDepartmentPrefix } from "@repo/db/generated/prisma/client";

export const toOpdDepartmentPrefixDTO = async (
  opdDepartmentPrefix: OpdDepartmentPrefix,
): Promise<OpdDepartmentPrefixDTO> => {
  const omittedItemStore = customOmit<
    OpdDepartmentPrefix,
    | "isActive"
    | "createdBy"
    | "updatedBy"
    | "deletedBy"
    | "createdAt"
    | "updatedAt"
    | "deletedAt"
  >(opdDepartmentPrefix, [
    "isActive",
    "createdBy",
    "updatedBy",
    "deletedBy",
    "createdAt",
    "updatedAt",
    "deletedAt",
  ]);
  const opdDepartment =
    await opdDepartmentService.getOpdDepartmentByIdWithOutDto(
      opdDepartmentPrefix.opdDepartmentId,
      true,
    );
  return {
    ...omittedItemStore.rest,
    opdDepartment: toIdValue(opdDepartment, "departmentName"),
  };
};
