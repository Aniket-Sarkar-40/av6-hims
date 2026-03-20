import { Prisma } from "@repo/db/generated/prisma/client";

export type CreateOrUpdateSettings = Omit<
  Prisma.OpdSettingsCreateInput,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;
