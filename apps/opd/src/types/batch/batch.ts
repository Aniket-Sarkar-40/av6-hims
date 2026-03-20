import { Prisma } from "@repo/db/generated/prisma/client";

export type BatchJobInput = Omit<
  Prisma.BatchJobCreateManyInput,
  "id" | "createdAt" | "updatedAt"
>;
export type BatchDetailsInput = Omit<
  Prisma.BatchJobDetailsUncheckedCreateInput,
  "id"
>;
