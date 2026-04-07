import { employeeService } from "@/services/staff/employee.service.js";
import { ApprovalActionDto } from "@/types/approval/approval.js";
import { ApprovalAction } from "@repo/db/generated/prisma/client";
import { customOmit } from "av6-core";

export const toLastApproverDetailsDto = async (
  appAction: ApprovalAction
): Promise<ApprovalActionDto> => {
  const approverDetails = await employeeService.getEmployeeByIdFrmCacheOrDb(
    appAction.actedBy,
    true
  );
  const omittedAppAction = customOmit<ApprovalAction, "actedBy">(appAction, [
    "actedBy",
  ]);

  return {
    ...omittedAppAction.rest,
    actedByDetails: approverDetails ? approverDetails : null,
  };
};
