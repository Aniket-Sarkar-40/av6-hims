import {
  AutoAlertAudit,
  AutoAlertEmail,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";

export type CreateAutoAlertEmailInput = Omit<
  Prisma.AutoAlertEmailUncheckedCreateWithoutAutoAlertAuditsInput,
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
  Prisma.AutoAlertAuditUncheckedCreateInput,
  "id" | "isActive" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
>;
export interface UpdateAutoAlertAuditInput extends Partial<CreateAutoAlertAuditInput> {
  id: number;
}

export type AutoAlertEmailDTO = Omit<
  AutoAlertEmail,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export interface AutoAlertAuditDTO extends Omit<
  AutoAlertAudit,
  "createdBy" | "updatedBy" | "recipientId"
> {
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
  recipient: AutoAlertEmailDTO | null;
}
