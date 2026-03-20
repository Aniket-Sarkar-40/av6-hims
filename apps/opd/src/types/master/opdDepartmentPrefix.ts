import { Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";

export type CreateOrUpdateOpdDepartmentPrefix = Omit<
  Prisma.OpdDepartmentPrefixUncheckedCreateInput,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export interface OpdDepartmentPrefixDTO extends Omit<
  CreateOrUpdateOpdDepartmentPrefix,
  | "createdBy"
  | "updatedBy"
  | "isActive"
  | "deletedAt"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "opdDepartmentId"
> {
  opdDepartment: IdValue | null;
}
