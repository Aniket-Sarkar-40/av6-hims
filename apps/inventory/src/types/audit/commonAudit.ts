import { Prisma } from "@repo/db/generated/prisma/client";
import { BaseModelAttr } from "@repo/shared/types/global.js";

export type ItemSupplierMapAuditCreateInput = Omit<
  Prisma.InvItemSupplierMapAuditUncheckedCreateWithoutItemSuppierMapAuditDetailsInput,
  "id" | BaseModelAttr
>;

export type ItemSupplierMapAuditDetailsCreateInput = Omit<
  Prisma.InvItemSuppierMapAuditDetailsUncheckedCreateInput,
  "id" | "isActive"
>;
