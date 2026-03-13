import { Prisma } from "@repo/db/generated/prisma/client";

export type CreateServiceEvent = Omit<
  Prisma.ServiceEventCreateManyInput,
  "createdBy" | "updatedBy" | "createdAt" | "updatedAt" | "eventConfig"
>;
