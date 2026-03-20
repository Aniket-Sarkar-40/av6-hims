import { Prisma } from "@repo/db/generated/prisma/client";

export type CreateOrUpdateMedicineTab = Omit<
  Prisma.MedicineTabUncheckedCreateInput,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;
