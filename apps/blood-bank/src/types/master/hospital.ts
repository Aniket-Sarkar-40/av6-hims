import {
  CollectionCenter,
  Hospital,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttr } from "@repo/shared/types/global.js";

export type HospitalReq = Prisma.HospitalUncheckedCreateInput;
export interface HospitalDTO extends Omit<Hospital, BaseModelAttr> {
  collectionCenter: CollectionCenter | null;
}
export interface HospitalDTOLocation extends Omit<Hospital, BaseModelAttr> {
  collectionCenter: CollectionCenter | null;
}

export type HospitalResponse = Prisma.HospitalGetPayload<{
  include: {
    collectionCenter: true;
  };
}>;
