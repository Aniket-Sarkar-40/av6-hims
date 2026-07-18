import { employeeService } from "@/services/staff/employee.service.js";
import { EmployeeCache } from "@/types/staff/employee.js";
import { ApprovalAction } from "@repo/db/generated/prisma/client";
import { customOmit } from "av6-core-v2";

interface ApprovalActionDto extends Omit<ApprovalAction, "actedBy"> {
  actedByDetails: EmployeeCache | null;
}

export const toLastApproverDetailsDto = async (
  appAction: ApprovalAction,
): Promise<ApprovalActionDto> => {
  const approverDetails = await employeeService.getEmployeeByIdFrmCacheOrDb(
    appAction.actedBy,
    true,
  );
  const omittedAppAction = customOmit<ApprovalAction, "actedBy">(appAction, [
    "actedBy",
  ]);

  return {
    ...omittedAppAction.rest,
    actedByDetails: approverDetails ? approverDetails : null,
  };
};
