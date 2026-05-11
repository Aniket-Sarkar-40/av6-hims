import { AccEmailConfig } from "@repo/db/generated/prisma/client";

export type CreateOrUpdateEmailConfig = Omit<
  AccEmailConfig,
  "id" | "createdAt" | "isActive"
> & {
  existing: AccEmailConfig | null;
};
