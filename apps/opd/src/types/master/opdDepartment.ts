import { OpdDepartment, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";

export type CreateOrUpdateOpdDepartment = Omit<
  Prisma.OpdDepartmentUncheckedCreateInput,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
  | "opdDepartmentPrefix"
>;

export interface OpdDepartmentDTO extends Omit<
  OpdDepartment,
  "isActive" | "deletedAt" | "deletedBy" | "createdBy" | "updatedBy"
> {
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
}
