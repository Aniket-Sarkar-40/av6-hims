import { Prisma } from "@repo/db/generated/prisma/client";

export type CreateOrUpdateCostCenterAllocationInput = Omit<
  Prisma.CostCenterAllocationCreateManyInput,
  | "id"
  | "isActive"
  | "updatedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "deletedBy"
>;
