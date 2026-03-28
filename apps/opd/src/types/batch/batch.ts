import { Prisma } from "@repo/db/generated/prisma/client";

export type BatchJobInput = Omit<
  Prisma.OpdBatchJobCreateInput,
  "id" | "createdAt" | "updatedAt"
>;
export type BatchDetailsInput = Omit<
  Prisma.BatchJobDetailsUncheckedCreateInput,
  "id"
>;
