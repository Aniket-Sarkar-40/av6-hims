import {
  InvAutoAlertAudit,
  InvAutoAlertEmail,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/common.js";

export type CreateAutoAlertEmailInput = Omit<
  Prisma.InvAutoAlertEmailUncheckedCreateWithoutAutoAlertAuditsInput,
  | "id"
  | "isActive"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
>;

export interface UpdateAutoAlertEmailInput extends CreateAutoAlertEmailInput {
  id: number;
}

export type CreateAutoAlertAuditInput = Omit<
  Prisma.InvAutoAlertAuditUncheckedCreateInput,
  "id" | "isActive" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
>;
export interface UpdateAutoAlertAuditInput
  extends Partial<CreateAutoAlertAuditInput> {
  id: number;
}

export type AutoAlertEmailDTO = Omit<
  InvAutoAlertEmail,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export interface AutoAlertAuditDTO
  extends Omit<InvAutoAlertAudit, "createdBy" | "updatedBy" | "recipientId"> {
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
  recipient: AutoAlertEmailDTO | null;
}
