import { Prisma } from "@repo/db/generated/prisma/client";

export type CreateFeatureFlagInput = Omit<
  Prisma.AccFeatureFlagCreateInput,
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "isActive"
>;

export interface UpdateFeatureFlagInput extends CreateFeatureFlagInput {
  id: number;
}
