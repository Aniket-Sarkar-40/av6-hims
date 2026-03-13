import { Prisma } from "@repo/db/generated/prisma/client";

export type CreateOrUpdateTemplate = Omit<
  Prisma.TemplateCreateManyInput,
  | "createdBy"
  | "updatedBy"
  | "createdAt"
  | "updatedAt"
  | "isActive"
  | "deletedAt"
  | "deletedBy"
>;
