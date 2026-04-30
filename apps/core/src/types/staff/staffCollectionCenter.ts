import {
  Prisma,
  StaffCollectionCenter,
} from "@repo/db/generated/prisma/client";

export interface StaffCollectionCenterDTO extends StaffCollectionCenter {}

export type CreateOrUpdateStaffCollectionCenter =
  Prisma.StaffCollectionCenterUncheckedCreateInput;
