import { ChipsButtonMapping, Prisma } from "@repo/db/generated/prisma/client";
import { IdValue } from "@repo/shared/types/global.js";

export type CreateOrUpdateChipsButtonMapping = Omit<
  Prisma.ChipsButtonMappingUncheckedCreateInput,
  | "isActive"
  | "createdBy"
  | "updatedBy"
  | "deletedBy"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export interface chipsButtonMappingDTO extends Omit<
  ChipsButtonMapping,
  | "isActive"
  | "deletedAt"
  | "deletedBy"
  | "createdBy"
  | "updatedBy"
  | "doctorId"
> {
  createdBy: IdValue | null;
  updatedBy: IdValue | null;
  doctor: IdValue | null;
}

export type chipsButtonMappingRes = Prisma.ChipsButtonMappingGetPayload<{
  include: {
    doctor: true;
  };
}>;
