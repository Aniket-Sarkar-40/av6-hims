import { Prisma } from "@repo/db/generated/prisma/client";

export interface CreateOrUpdateTemplate extends Omit<
  Prisma.TemplateUncheckedCreateInput,
  | "createdBy"
  | "updatedBy"
  | "createdAt"
  | "updatedAt"
  | "isActive"
  | "deletedAt"
  | "deletedBy"
> {
  eventConfigId: number;
}
