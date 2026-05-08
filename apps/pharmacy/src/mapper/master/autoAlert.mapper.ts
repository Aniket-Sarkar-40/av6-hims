import { autoAlertService } from "@/services/master/autoAlert.service.js";
import { employeeService } from "@/services/staff/employee.service.js";
import { AutoAlertAuditDTO } from "@/types/master/autoAlert.js";
import {
  AutoAlertAudit,
  AutoAlertEmail,
} from "@repo/db/generated/prisma/client";
import { customOmit } from "av6-core-v2";
import { toIdValue } from "av6-utils";

export const toAutoAlertAuditDTO = async (
  input: AutoAlertAudit
): Promise<AutoAlertAuditDTO> => {
  const createdBy = input.createdBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(input.createdBy, true)
    : null;
  const updatedBy = input.updatedBy
    ? await employeeService.getEmployeeByIdFrmCacheOrDb(input.updatedBy, true)
    : null;

  const recipient = input.recipientId
    ? await autoAlertService.getAutoAlertEmailById(input.recipientId, true)
    : null;
  const omittedRecipient = recipient
    ? customOmit<
        AutoAlertEmail,
        | "isActive"
        | "createdBy"
        | "updatedBy"
        | "deletedBy"
        | "createdAt"
        | "updatedAt"
        | "deletedAt"
      >(recipient, [
        "isActive",
        "createdBy",
        "updatedBy",
        "deletedBy",
        "createdAt",
        "updatedAt",
        "deletedAt",
      ])
    : null;
  const omittedInput = customOmit<
    AutoAlertAudit,
    "createdBy" | "updatedBy" | "recipientId"
  >(input, ["createdBy", "updatedBy", "recipientId"]);
  return {
    ...omittedInput.rest,
    createdBy: toIdValue(createdBy, "name"),
    updatedBy: toIdValue(updatedBy, "name"),
    recipient: omittedRecipient?.rest ?? null,
  };
};
