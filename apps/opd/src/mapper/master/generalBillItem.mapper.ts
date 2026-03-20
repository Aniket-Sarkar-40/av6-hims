import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { GeneralBillItemMasterDTO } from "@/types/master/generalBillItem.js";
import { customOmit, toIdValue } from "av6-utils";
import { GeneralBillItem } from "@repo/db/generated/prisma/client";

export const toGeneralBillItemMasterDTO = async (
  generalBillItem: GeneralBillItem,
): Promise<GeneralBillItemMasterDTO> => {
  const omittedGeneralBillItem = customOmit<
    GeneralBillItem,
    "isActive" | "createdBy" | "updatedBy" | "deletedBy" | "deletedAt"
  >(generalBillItem, [
    "isActive",
    "createdBy",
    "updatedBy",
    "deletedBy",
    "deletedAt",
  ]);

  const createdBy = generalBillItem.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        generalBillItem.createdBy,
        true,
      )
    : null;
  const updatedBy = generalBillItem.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(
        generalBillItem.updatedBy,
        true,
      )
    : null;

  return {
    ...omittedGeneralBillItem.rest,
    createdBy: createdBy ? toIdValue(createdBy, "name") : null,
    updatedBy: updatedBy ? toIdValue(updatedBy, "name") : null,
  };
};
