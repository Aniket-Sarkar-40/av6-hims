import { Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttr } from "../common.js";

export type CreateOrUpdateAuditConfig = Omit<
  Prisma.AccAuditConfigUncheckedCreateInput,
  BaseModelAttr
>;
