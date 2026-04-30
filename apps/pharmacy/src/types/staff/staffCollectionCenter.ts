import {
  Prisma,
  StaffCollectionCenter,
} from "@repo/db/generated/prisma/client";

export type StaffCollectionCenterDTO = StaffCollectionCenter;

export type CreateOrUpdateStaffCollectionCenter =
  Prisma.StaffCollectionCenterUncheckedCreateInput;
